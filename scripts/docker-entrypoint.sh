#!/bin/sh
set -e

echo "==> Starting PTC Furnitures Container Entrypoint..."

# Ensure the upload directory exists
mkdir -p /app/public/upload

# Copy pre-seeded images to the volume mount if it's empty
if [ -d /app/public/upload_default ] && [ "$(ls -A /app/public/upload_default 2>/dev/null)" ]; then
  echo "==> Restoring pre-seeded default assets to /app/public/upload if missing..."
  cp -rn /app/public/upload_default/. /app/public/upload/ 2>/dev/null || true
fi

# Test write permissions for the 'node' user
# If node can write, we drop privileges to 'node'.
# Otherwise we run as the starting user (root) to guarantee read/write access.
if su node -s /bin/sh -c "touch /app/public/upload/.perm_check" 2>/dev/null; then
  echo "==> /app/public/upload is writable by the 'node' user."
  rm -f /app/public/upload/.perm_check
  chown -R node:node /app/public/upload 2>/dev/null || true
  echo "==> Starting Next.js standalone server as 'node' user..."
  exec su node -s /bin/sh -c "node server.js"
else
  echo "==> WARNING: /app/public/upload is not writable by the 'node' user (likely a rootless bind mount)."
  echo "==> Running Next.js standalone server as the current user (root) to ensure read/write access."
  exec node server.js
fi
