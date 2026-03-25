#!/bin/bash

# ============================================================
# 35peti Project - Run All Servers script
# ============================================================

export ROOT="$(cd "$(dirname "$0")" && pwd)"

# Source necessary modular components
source "$ROOT/scripts/utils.sh"
source "$ROOT/scripts/start.sh"

echo ""
log "Initializing the startup sequence for all 35peti servers..."
echo ""

start_servers
