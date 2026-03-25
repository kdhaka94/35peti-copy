#!/bin/bash

# ============================================================
# START SERVERS
# ============================================================

start_servers() {
  log "Starting backend on :3010..."
  (cd "$ROOT/backend" && ./node_modules/.bin/ts-node-dev --respawn --transpile-only src/index.ts > /tmp/35peti-backend.log 2>&1) &
  echo $! > /tmp/35peti-backend.pid

  log "Starting super-node on :3025..."
  (cd "$ROOT/super-node" && NODE_ENV=development nodemon --ignore 'dist/src/*.json' dist > /tmp/35peti-supernode.log 2>&1) &
  echo $! > /tmp/35peti-supernode.pid

  log "Starting socket on :3003..."
  (cd "$ROOT/socket" && npm start > /tmp/35peti-socket.log 2>&1) &
  echo $! > /tmp/35peti-socket.pid

  log "Starting frontend (React)..."
  (cd "$ROOT/frontend" && DISABLE_ESLINT_PLUGIN=true npm start > /tmp/35peti-frontend.log 2>&1) &
  echo $! > /tmp/35peti-frontend.pid

  log "Starting Ourserver on :6000..."
  (cd "$ROOT/Ourserver" && node index.js > /tmp/35peti-ourserver.log 2>&1) &
  echo $! > /tmp/35peti-ourserver.pid

  log "Starting Redis-node..."
  (cd "$ROOT/Redis-node" && node index.js > /tmp/35peti-redisnode.log 2>&1) &
  echo $! > /tmp/35peti-redisnode.pid

  log "Starting Python Flask on :5000..."
  (cd "$ROOT/python" && python3 src/app.py > /tmp/35peti-python.log 2>&1) &
  echo $! > /tmp/35peti-python.pid

  echo ""
  echo -e "${GREEN}✅ All servers started!${NC}"
  echo ""
  echo "  Backend      → http://localhost:3010"
  echo "  Super-node   → http://localhost:3025"
  echo "  Socket       → http://localhost:3003"
  echo "  Frontend     → http://localhost:3000 (or 3001/3002 if port taken)"
  echo "  Ourserver    → http://localhost:6000"
  echo "  Redis-node   → (background)"
  echo "  Python Flask → http://localhost:5000"
  echo ""
  echo "  Logs in: /tmp/35peti-*.log"
  echo "  To stop all: ./setup.sh stop"
}
