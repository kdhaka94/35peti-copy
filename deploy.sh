#!/bin/bash

# ============================================================
# 35pp Deployment Script
# Usage: ./deploy.sh [--skip-frontend] [--skip-backend]
# ============================================================

set -euo pipefail

# --- Config ---
SERVER_IP="89.116.229.114"
SERVER_USER="root"
SSH_KEY="$(dirname "$0")/35peti"
APP_DIR="/var/www/35pp"

# --- Flags ---
SKIP_FRONTEND=false
SKIP_BACKEND=false

for arg in "$@"; do
  case $arg in
    --skip-frontend) SKIP_FRONTEND=true ;;
    --skip-backend)  SKIP_BACKEND=true ;;
  esac
done

# --- Colors ---
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}[DEPLOY]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC}  $1"; }
fail() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# Validate SSH key
[ -f "$SSH_KEY" ] || fail "SSH key not found at: $SSH_KEY"
chmod 600 "$SSH_KEY"

log "Starting deployment to ${SERVER_USER}@${SERVER_IP}..."

ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "${SERVER_USER}@${SERVER_IP}" << REMOTE_SCRIPT
set -e

# Make node/yarn available in non-interactive SSH sessions
export PATH="/root/.nvm/versions/node/v22.21.1/bin:/usr/local/bin:/usr/bin:/bin"

APP_DIR="${APP_DIR}"

echo ""
echo "========================================="
echo " Pulling latest code from origin/main"
echo "========================================="
cd "\$APP_DIR"
git reset --hard HEAD
git clean -fd -e backend/uploads
git pull origin main

if [ "${SKIP_BACKEND}" = false ]; then
  echo ""
  echo "========================================="
  echo " Building Backend"
  echo "========================================="
  cd "\$APP_DIR/backend"
  yarn install --frozen-lockfile --silent
  yarn build
fi

if [ "${SKIP_FRONTEND}" = false ]; then
  echo ""
  echo "========================================="
  echo " Building Frontend"
  echo "========================================="
  cd "\$APP_DIR/frontend"
  yarn install --frozen-lockfile --silent
  DISABLE_ESLINT_PLUGIN=true GENERATE_SOURCEMAP=false yarn build

  if [ -f "\$APP_DIR/frontend/build/index.html" ]; then
    echo "✅ Frontend build successful — index.html found."
  else
    echo "❌ Frontend build FAILED — index.html missing!"
    exit 1
  fi
fi

echo ""
echo "========================================="
echo " Restarting PM2 Processes"
echo "========================================="
pm2 restart all

echo ""
echo "========================================="
echo " PM2 Status"
echo "========================================="
pm2 status

echo ""
echo "✅ Deployment complete!"

REMOTE_SCRIPT

log "Done. ✅"
