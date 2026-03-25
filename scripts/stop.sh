#!/bin/bash

# ============================================================
# STOP SERVERS
# ============================================================

stop_servers() {
  log "Stopping all 35peti servers..."
  for svc in backend supernode socket frontend ourserver redisnode python; do
    PID_FILE="/tmp/35peti-${svc}.pid"
    if [ -f "$PID_FILE" ]; then
      PID=$(cat "$PID_FILE")
      kill "$PID" 2>/dev/null && log "Stopped $svc (pid $PID)" || warn "$svc was not running"
      rm -f "$PID_FILE"
    fi
  done
  
  # Kill child processes that might spawn detatched
  pkill -f "ts-node-dev.*35peti" 2>/dev/null
  pkill -f "nodemon.*35peti" 2>/dev/null
  
  log "Done."
}
