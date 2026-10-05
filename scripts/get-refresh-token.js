const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require('url');
const { exec } = require('child_process');

// Helper to auto-load .env file
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

const CLIENT_ID =
  process.env.BACKUP_GDRIVE_CLIENT_ID || process.env.GDRIVE_CLIENT_ID;
const CLIENT_SECRET =
  process.env.BACKUP_GDRIVE_CLIENT_SECRET || process.env.GDRIVE_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    '\n[ERROR] BACKUP_GDRIVE_CLIENT_ID and BACKUP_GDRIVE_CLIENT_SECRET are required!'
  );
  console.error(
    'Please add them to your .env file before running this script.\n'
  );
  process.exit(1);
}

const PORT = 3456;
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;
const SCOPES = encodeURIComponent('https://www.googleapis.com/auth/drive');

const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
  REDIRECT_URI
)}&response_type=code&scope=${SCOPES}&access_type=offline&prompt=consent`;

console.log('\n======================================================');
console.log('==> Please open the following URL in your browser:');
console.log(authUrl);
console.log('======================================================\n');

// Try to open automatically in default browser (Windows)
exec(`start "" "${authUrl}"`, (err) => {
  // Ignore error if start fails, URL is printed above
});

const server = http.createServer(async (req, res) => {
  try {
    const parsedUrl = url.parse(req.url, true);
    if (parsedUrl.pathname === '/oauth2callback') {
      const code = parsedUrl.query.code;

      if (!code) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end('<h1>Error: No authorization code received.</h1>');
        return;
      }

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <div style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h1 style="color: #16a34a;">Authentication Successful!</h1>
          <p>You can close this tab and return to the IDE terminal.</p>
        </div>
      `);

      console.log('==> Authorization code received! Exchanging for Refresh Token...');

      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          redirect_uri: REDIRECT_URI,
          grant_type: 'authorization_code',
        }),
      });

      const tokenData = await tokenRes.json();

      if (tokenData.error) {
        console.error('==> Token Exchange Error:', tokenData);
      } else {
        console.log('\n******************************************************');
        console.log('==> SUCCESS! REFRESH TOKEN GENERATED:');
        console.log(tokenData.refresh_token);
        console.log('******************************************************\n');

        // Save to .gdrive-credentials.json
        const fs = require('fs');
        const path = require('path');
        const savePath = path.join(process.cwd(), '.gdrive-credentials.json');
        fs.writeFileSync(
          savePath,
          JSON.stringify(
            {
              client_id: CLIENT_ID,
              client_secret: CLIENT_SECRET,
              refresh_token: tokenData.refresh_token,
            },
            null,
            2
          )
        );
        console.log(`==> Credentials saved to ${savePath}`);
      }

      setTimeout(() => {
        server.close();
        process.exit(0);
      }, 2000);
    }
  } catch (err) {
    console.error('Server error:', err);
  }
});

server.listen(PORT, () => {
  console.log(`==> Waiting for authorization callback on port ${PORT}...`);
});
