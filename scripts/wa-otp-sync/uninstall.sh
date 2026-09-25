#!/bin/bash
LABEL="com.thriftanything.wa-otp-sync"
launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
rm -f "$HOME/Library/LaunchAgents/$LABEL.plist"
echo "Stopped. Config and log are still in ~/.golektruk-otp (delete that folder to remove them)."
