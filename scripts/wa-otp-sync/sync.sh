#!/bin/bash
# Reads new GolekTruk messages from WhatsApp desktop's local database and posts
# them to /api/otp/ingest. Runs every 20s under launchd (see install.sh).
# Uses only tools that ship with macOS: bash, sqlite3, curl.
set -u
HOME_DIR="$HOME/.golektruk-otp"
# shellcheck source=/dev/null
source "$HOME_DIR/config"            # INGEST_URL, INGEST_TOKEN, optional CHAT_MATCH, INCLUDE_GROUPS
CHAT_MATCH="${CHAT_MATCH:-golektruk}" # matched against chat name, lowercase, spaces removed
INCLUDE_GROUPS="${INCLUDE_GROUPS:-0}"
DB="$HOME/Library/Group Containers/group.net.whatsapp.WhatsApp.shared/ChatStorage.sqlite"
STATE="$HOME_DIR/last_pk"
log() { echo "$(date '+%F %T') $*"; }

[ -f "$DB" ] || { log "ERROR: WhatsApp database not found. Is WhatsApp desktop installed and linked?"; exit 1; }

# Only letters/digits in the match string, so it can't break the SQL.
MATCH=$(printf '%s' "$CHAT_MATCH" | tr -cd '[:alnum:]' | tr '[:upper:]' '[:lower:]')
GROUP_FILTER="AND s.ZCONTACTJID NOT LIKE '%@g.us'"
[ "$INCLUDE_GROUPS" = "1" ] && GROUP_FILTER=""

run_sql() { /usr/bin/sqlite3 -readonly "$@" "file:$DB?mode=ro" 2>&1; }

LAST=$(cat "$STATE" 2>/dev/null | tr -cd '0-9')
if [ -z "$LAST" ]; then
  # First run: start from the last 7 days instead of the whole history.
  LAST=$(run_sql -batch -noheader "SELECT COALESCE(MIN(Z_PK)-1, (SELECT COALESCE(MAX(Z_PK),0) FROM ZWAMESSAGE)) FROM ZWAMESSAGE WHERE ZMESSAGEDATE > (strftime('%s','now') - 978307200 - 7*86400);")
  if ! [[ "$LAST" =~ ^[0-9]+$ ]]; then log "ERROR reading database: $LAST"; exit 1; fi
fi

WHERE="m.Z_PK > $LAST AND m.ZTEXT IS NOT NULL AND m.ZMESSAGETYPE = 0
  AND replace(lower(s.ZPARTNERNAME),' ','') LIKE '%$MATCH%' $GROUP_FILTER"

ROWS=$(run_sql -json "
  SELECT COALESCE(s.ZCONTACTJID,'') || ':' || COALESCE(m.ZSTANZAID, m.Z_PK) AS id,
         s.ZPARTNERNAME AS chat_name,
         CASE WHEN m.ZISFROMME = 1 THEN NULL ELSE COALESCE(NULLIF(gm.ZCONTACTNAME,''), NULLIF(gm.ZFIRSTNAME,''), s.ZPARTNERNAME) END AS sender,
         CASE WHEN m.ZISFROMME = 1 THEN json('true') ELSE json('false') END AS from_me,
         m.ZTEXT AS body,
         strftime('%Y-%m-%dT%H:%M:%SZ', m.ZMESSAGEDATE + 978307200, 'unixepoch') AS sent_at
  FROM ZWAMESSAGE m
  JOIN ZWACHATSESSION s ON s.Z_PK = m.ZCHATSESSION
  LEFT JOIN ZWAGROUPMEMBER gm ON gm.Z_PK = m.ZGROUPMEMBER
  WHERE $WHERE
  ORDER BY m.Z_PK LIMIT 200;")
case "$ROWS" in ""|\[*) ;; *) log "ERROR reading database: $ROWS"; exit 1;; esac
[ -z "$ROWS" ] && ROWS="[]"

NEW_LAST=$(run_sql -batch -noheader "
  SELECT COALESCE(MAX(pk), $LAST) FROM (
    SELECT m.Z_PK AS pk FROM ZWAMESSAGE m JOIN ZWACHATSESSION s ON s.Z_PK = m.ZCHATSESSION
    WHERE $WHERE ORDER BY m.Z_PK LIMIT 200);")

# Always POST, even with no messages: that's the heartbeat the /otp page shows.
CODE=$(printf '{"messages":%s}' "$ROWS" | /usr/bin/curl -sS -o "$HOME_DIR/last_response" -w '%{http_code}' \
  --max-time 15 -X POST "$INGEST_URL" \
  -H "Authorization: Bearer $INGEST_TOKEN" -H 'Content-Type: application/json' --data-binary @-)

if [ "$CODE" = "200" ]; then
  echo "$NEW_LAST" > "$STATE"
  [ "$NEW_LAST" != "$LAST" ] && log "sent messages up to pk $NEW_LAST"
else
  log "ERROR: ingest returned HTTP $CODE: $(head -c 300 "$HOME_DIR/last_response")"
  exit 1
fi
