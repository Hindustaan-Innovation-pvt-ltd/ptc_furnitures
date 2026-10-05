const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Helper to auto-load .env file if running locally or outside container
function loadEnv() {
  const envPaths = [path.join(process.cwd(), '.env'), path.join(__dirname, '../.env')];
  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
      break;
    }
  }
}
loadEnv();

// Configuration
const BACKUP_DIR =
  process.env.BACKUP_DIR ||
  (process.platform === 'win32'
    ? path.join(process.cwd(), 'backups')
    : '/backups');
const MONGODB_URI = process.env.MONGODB_URI;
const RETENTION_DAYS = parseInt(
  process.env.BACKUP_RETENTION_DAYS || process.env.RETENTION_DAYS || '14',
  10
);
const RETENTION_DRIVE_COUNT = parseInt(
  process.env.BACKUP_RETENTION_DRIVE_COUNT || process.env.RETENTION_DRIVE_COUNT || '30',
  10
);

// Google Drive Folder ID
let GOOGLE_DRIVE_FOLDER_ID =
  process.env.BACKUP_GDRIVE_FOLDER_ID || process.env.GOOGLE_DRIVE_FOLDER_ID;

function loadCredentials() {
  const clientId =
    process.env.BACKUP_GDRIVE_CLIENT_ID || process.env.GDRIVE_CLIENT_ID;
  const clientSecret =
    process.env.BACKUP_GDRIVE_CLIENT_SECRET || process.env.GDRIVE_CLIENT_SECRET;
  const refreshToken =
    process.env.BACKUP_GDRIVE_REFRESH_TOKEN || process.env.GDRIVE_REFRESH_TOKEN;

  if (clientId && clientSecret && refreshToken) {
    return {
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    };
  }

  const possiblePaths = [
    path.join(process.cwd(), '.gdrive-credentials.json'),
    '/app/.gdrive-credentials.json',
    path.join(__dirname, '../.gdrive-credentials.json'),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        const raw = fs.readFileSync(p, 'utf8');
        return JSON.parse(raw);
      } catch (err) {
        console.error(`[BACKUP] Error parsing credentials from ${p}:`, err.message);
      }
    }
  }

  throw new Error('Google Drive credentials not found! Set env vars or provide .gdrive-credentials.json');
}

async function getAccessToken(creds) {
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: creds.client_id,
      client_secret: creds.client_secret,
      refresh_token: creds.refresh_token,
      grant_type: 'refresh_token',
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenRes.ok || !tokenData.access_token) {
    throw new Error(`Failed to refresh Google access token: ${JSON.stringify(tokenData)}`);
  }

  return tokenData.access_token;
}

async function ensureDriveFolder(accessToken) {
  if (GOOGLE_DRIVE_FOLDER_ID) {
    return GOOGLE_DRIVE_FOLDER_ID;
  }

  console.log('[BACKUP] Searching for Google Drive folder "PTC_DATABASE_BACKUP"...');
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
    "name = 'PTC_DATABASE_BACKUP' and mimeType = 'application/vnd.google-apps.folder' and trashed = false"
  )}&fields=files(id,name)`;

  const searchRes = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const data = await searchRes.json();
  if (data.files && data.files.length > 0) {
    GOOGLE_DRIVE_FOLDER_ID = data.files[0].id;
    return GOOGLE_DRIVE_FOLDER_ID;
  }

  // Create folder if not found
  console.log('[BACKUP] Creating folder "PTC_DATABASE_BACKUP" on Google Drive...');
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'PTC_DATABASE_BACKUP',
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });

  const createData = await createRes.json();
  GOOGLE_DRIVE_FOLDER_ID = createData.id;
  return GOOGLE_DRIVE_FOLDER_ID;
}

function runMongoDump(outputPath) {
  return new Promise((resolve, reject) => {
    // Mask password in logs
    const maskedUri = MONGODB_URI.replace(/:([^:@]+)@/, ':****@');
    console.log(`[BACKUP] Executing mongodump against: ${maskedUri}`);

    const cmd = `mongodump --uri="${MONGODB_URI}" --archive="${outputPath}" --gzip`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error('[BACKUP] mongodump stderr:', stderr);
        return reject(error);
      }
      if (stdout) console.log('[BACKUP] mongodump stdout:', stdout);
      resolve(outputPath);
    });
  });
}

async function uploadToGoogleDrive(filePath, fileName, accessToken, folderId) {
  console.log(`[BACKUP] Uploading ${fileName} to Google Drive folder ${folderId}...`);
  const fileBuffer = fs.readFileSync(filePath);

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = {
    name: fileName,
    parents: [folderId],
  };

  const multipartBody = Buffer.concat([
    Buffer.from(
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/gzip\r\n\r\n'
    ),
    fileBuffer,
    Buffer.from(closeDelimiter),
  ]);

  const uploadRes = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartBody,
    }
  );

  const uploadData = await uploadRes.json();
  if (!uploadRes.ok) {
    throw new Error(`Google Drive Upload failed: ${JSON.stringify(uploadData)}`);
  }

  console.log(`[BACKUP] Upload SUCCESS! Drive File ID: ${uploadData.id} (${uploadData.name})`);
  return uploadData;
}

async function cleanOldDriveBackups(accessToken, folderId) {
  try {
    const listUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
      `'${folderId}' in parents and trashed = false`
    )}&orderBy=createdTime desc&fields=files(id,name,createdTime)`;

    const listRes = await fetch(listUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const data = await listRes.json();
    const files = data.files || [];

    if (files.length > RETENTION_DRIVE_COUNT) {
      const filesToDelete = files.slice(RETENTION_DRIVE_COUNT);
      console.log(`[BACKUP] Drive retention policy: Deleting ${filesToDelete.length} old backup(s)...`);

      for (const file of filesToDelete) {
        await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        console.log(`[BACKUP] Deleted old Drive backup: ${file.name} (${file.id})`);
      }
    }
  } catch (err) {
    console.error('[BACKUP] Error cleaning old Drive backups:', err.message);
  }
}

function cleanOldLocalBackups() {
  try {
    if (!fs.existsSync(BACKUP_DIR)) return;
    const now = Date.now();
    const maxAgeMs = RETENTION_DAYS * 24 * 60 * 60 * 1000;

    const files = fs.readdirSync(BACKUP_DIR);
    for (const file of files) {
      if (!file.endsWith('.gz')) continue;
      const fullPath = path.join(BACKUP_DIR, file);
      const stats = fs.statSync(fullPath);
      if (now - stats.mtimeMs > maxAgeMs) {
        fs.unlinkSync(fullPath);
        console.log(`[BACKUP] Deleted old local backup: ${file}`);
      }
    }
  } catch (err) {
    console.error('[BACKUP] Error cleaning old local backups:', err.message);
  }
}

async function performBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `backup_${timestamp}.gz`;

  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const localFilePath = path.join(BACKUP_DIR, fileName);

  console.log(`\n======================================================`);
  console.log(`[BACKUP] Starting Backup Job at ${new Date().toLocaleString()}`);
  console.log(`======================================================`);

  try {
    // 1. Run Mongo Dump
    await runMongoDump(localFilePath);
    const stats = fs.statSync(localFilePath);
    console.log(`[BACKUP] Local backup created: ${localFilePath} (${(stats.size / 1024).toFixed(2)} KB)`);

    // 2. Upload to Google Drive
    const creds = loadCredentials();
    const accessToken = await getAccessToken(creds);
    const folderId = await ensureDriveFolder(accessToken);

    await uploadToGoogleDrive(localFilePath, fileName, accessToken, folderId);

    // 3. Cleanups
    await cleanOldDriveBackups(accessToken, folderId);
    cleanOldLocalBackups();

    console.log(`[BACKUP] Backup Job Completed Successfully! Next backup in 24 hours.\n`);
  } catch (err) {
    console.error('[BACKUP] BACKUP JOB FAILED:', err);
  }
}

// Target: 2:00 AM daily
function getMillisUntilNextRun() {
  const now = new Date();
  const next = new Date();
  next.setHours(2, 0, 0, 0); // 2:00 AM

  if (now.getTime() >= next.getTime()) {
    next.setDate(next.getDate() + 1);
  }

  return next.getTime() - now.getTime();
}

async function startDaemon() {
  console.log('[BACKUP] MongoDB Google Drive Auto-Backup Daemon started.');

  // Run initial backup immediately on startup so user verifies it right away!
  await performBackup();

  // Then schedule for next 2:00 AM and every 24 hours thereafter
  const waitMs = getMillisUntilNextRun();
  const hoursUntil = (waitMs / (1000 * 60 * 60)).toFixed(2);
  console.log(`[BACKUP] Scheduled next daily backup at 2:00 AM (in ~${hoursUntil} hours).`);

  setTimeout(async () => {
    await performBackup();
    // Subsequent backups every 24 hours
    setInterval(performBackup, 24 * 60 * 60 * 1000);
  }, waitMs);
}

// Allow one-off execution with --now
if (process.argv.includes('--now')) {
  performBackup().then(() => process.exit(0));
} else {
  startDaemon();
}
