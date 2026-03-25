#!/bin/bash

# ============================================================
# 35peti Project - Full Setup & Start Script
# Created: 2026-03-25
# ============================================================

# Directory where this script executes
export ROOT="$(cd "$(dirname "$0")" && pwd)"

# Source modular components
source "$ROOT/scripts/utils.sh"
source "$ROOT/scripts/env.sh"
source "$ROOT/scripts/install.sh"
source "$ROOT/scripts/start.sh"
source "$ROOT/scripts/stop.sh"

show_help() {
  echo -e "${GREEN}35peti Setup Script${NC}"
  echo "Usage:"
  echo "  ./setup.sh          → setup + start all servers (365 brand)"
  echo "  ./setup.sh 9x       → setup + start all servers (9x brand)"
  echo "  ./setup.sh setup    → only create .env files + install deps"
  echo "  ./setup.sh start    → only start all servers (assumes setup done)"
  echo "  ./setup.sh stop     → stops all running servers"
  echo ""
}

# Parse Arguments
BRAND="${1:-365}"
MODE="all"

if [[ "$1" == "help" || "$1" == "--help" || "$1" == "-h" ]]; then
  show_help
  exit 0
fi

if [[ "$1" == "setup" ]]; then BRAND="365"; MODE="setup"; fi
if [[ "$1" == "start" ]]; then MODE="start"; fi
if [[ "$1" == "stop" ]]; then stop_servers; exit 0; fi

# Main execution
if [[ "$MODE" == "all" || "$MODE" == "setup" ]]; then
  echo ""
  log "Setting up for brand: ${YELLOW}${BRAND}${NC}"
  echo ""

  log "Writing .env files..."
  if [[ "$BRAND" == "9x" ]]; then
    write_env_9x
  else
    write_env_365
  fi

  log "Fixing backend tsconfig.json..."
  fix_backend_tsconfig

  log "Installing all dependencies..."
  install_deps

  log "Setup complete!"
fi

if [[ "$MODE" == "all" || "$MODE" == "start" ]]; then
  start_servers
fi
