#!/bin/bash
# One-time setup on the Mac:  bash scripts/wa-otp-sync/install.sh
# Needs scripts/wa-otp-sync/config.local (created for you, gitignored).
set -euo pipefail
SRC="$(cd "$(dirname "$0")" && pwd)"
DEST="$HOME/.golektruk-otp"
LABEL="com.thriftanything.wa-otp-sync"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"

mkdir -p "$DEST" "$HOME/Library/LaunchAgents"
chmod 700 "$DEST"
if [ -f "$SRC/config.local" ]; then
  mv "$SRC/config.local" "$DEST/config"
fi
[ -f "$DEST/config" ] || { echo "Missing $DEST/config (INGEST_URL, INGEST_TOKEN)"; exit 1; }
chmod 600 "$DEST/config"
cp "$SRC/sync.sh" "$DEST/sync.sh"
chmod 700 "$DEST/sync.sh"

cat > "$PLIST" <<PL
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key><array><string>/bin/bash</string><string>$DEST/sync.sh</string></array>
  <key>StartInterval</key><integer>20</integer>
  <key>RunAtLoad</key><true/>
  <key>StandardOutPath</key><string>$DEST/sync.log</string>
  <key>StandardErrorPath</key><string>$DEST/sync.log</string>
</dict></plist>
PL

launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$PLIST"

echo "Running once now to check access..."
if /bin/bash "$DEST/sync.sh"; then
  echo "OK. Syncing every 20s. Log: $DEST/sync.log"
else
  echo "First run failed (see message above). If it says 'authorization denied' or 'unable to open',"
  echo "give Full Disk Access to /bin/bash: System Settings > Privacy & Security > Full Disk Access."
fi
