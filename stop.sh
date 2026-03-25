#!/bin/bash

# ============================================================
# 35peti Project - Stop All Servers script
# ============================================================

export ROOT="$(cd "$(dirname "$0")" && pwd)"

# Source necessary modular components
source "$ROOT/scripts/utils.sh"
source "$ROOT/scripts/stop.sh"

echo ""
stop_servers
echo ""
