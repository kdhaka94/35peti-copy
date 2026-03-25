#!/bin/bash

# ============================================================
# INSTALL DEPENDENCIES
# ============================================================

install_deps() {
  log "Installing backend dependencies..."
  (cd "$ROOT/backend" && npm install --save-dev ts-node-dev --silent)

  log "Installing super-node dependencies + building..."
  (cd "$ROOT/super-node" && npm install --silent && ./node_modules/.bin/tsc --project './tsconfig.json')

  log "Installing socket dependencies..."
  (cd "$ROOT/socket" && npm install --save-dev ts-node-dev --silent)

  log "Installing Ourserver dependencies..."
  (cd "$ROOT/Ourserver" && npm install --silent)

  log "Installing Redis-node dependencies..."
  (cd "$ROOT/Redis-node" && npm install --silent)

  log "Installing frontend dependencies (yarn)..."
  (cd "$ROOT/frontend" && yarn install --silent)

  log "Installing Python dependencies..."
  pip3 install flask-cors PyJWT requests -q
}
