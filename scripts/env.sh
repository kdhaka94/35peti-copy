#!/bin/bash

export ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# ============================================================
# ENV SETUP
# ============================================================

write_env_365() {
  log "Writing .env files for brand: 365"

  # ---- backend ----
  cat > "$ROOT/backend/.env" <<'EOF'
NODE_ENV="development"
PORT="3010"
LOG_DAYS=10
APP_MAX_UPLOAD_LIMIT="50mb"
APP_MAX_PARAMETER_LIMIT="5000"
CORS_ENABLED=true
API_PREFIX="api"
JWT_EXPIRES_IN='2h'
REDIS_QUEUE_PORT=6379
REDIS_QUEUE_HOST='localhost'
APP_NAME="Geek Dashboard"
APP_DESCRIPTION="A Web Server built with Express, Typescript, Mongoose, and Pug"
APP_URL="https://newdiamond365.com"
APP_KEYWORDS="web-server, typescript-express, typescript, express"
COMPANY_NAME="GeekyAnts"
SUPER_NODE_URL='https://socket2.newdiamond365.com/'
OD_NODE_URL="https://socket.newdiamond365.com"
USER_SOCKET_URL="https://socket.newdiamond365.com"
CASINO_SOCKET_URL='https://socket2.newdiamond365.com/'
APP_SECRET="1242#$%$^%!@@$!%*(%^metaversesolutions-metaversesolutions"
MONGOOSE_URL="mongodb+srv://365infayou:Jv9lwv6csl7J1Jp5@cluster365.sxln4q8.mongodb.net/infa?retryWrites=true&w=majority&appName=Cluster365"
EOF

  # ---- super-node .env ----
  cat > "$ROOT/super-node/.env" <<'EOF'
PORT=3525
SITE_URL=http://localhost:3525
SUPER_NODE_URL=http://172.236.19.246:3005
REDIS_URL_REPLICA=redis://:wvGLXqhDvbPcpDv7UrnIglB@172.236.19.246:6379
REDIS_URL_SUPER_NODE_FOR_BM="redis://localhost:6379"
CASINO_SERVER=http://138.68.135.93:3007
EOF

  # ---- super-node .env.development ----
  cat > "$ROOT/super-node/.env.development" <<'EOF'
PORT=3025
SITE_URL=http://localhost:3025
SUPER_NODE_URL=http://172.236.19.246:3005
REDIS_URL_REPLICA=redis://:wvGLXqhDvbPcpDv7UrnIglB@138.68.135.93:6379
REDIS_URL_SUPER_NODE_FOR_BM=redis://:wvGLXqhDvbPcpDv7UrnIglB@138.68.135.93:6379
CASINO_SERVER=http://138.68.135.93:3007
EOF

  # ---- socket ----
  cat > "$ROOT/socket/.env" <<'EOF'
SUPER_NODE_SOCKET_URL="https://socket2.newdiamond365.com/"
CLIENT_NODE_URL="https://api.newdiamond365.com/api"
REDIS_URL_REPLICA=redis://:wvGLXqhDvbPcpDv7UrnIglB@172.236.19.246:6379
EOF

  # ---- frontend ----
  cat > "$ROOT/frontend/.env" <<'EOF'
REACT_APP_API_KEY = 'my-secret-api-key'
REACT_APP_API_BASEURL = 'http://localhost:3010/api/'
REACT_APP_API_SPORTS_URL = 'https://api.driveexch.com/api/'
REACT_APP_API_SPORTS_FANCY_URL = 'http://localhost:3025/api/'
REACT_APP_API_SOCKET_URL = 'http://localhost:3003'
REACT_APP_IP_API_URL="https://ipapi.co/json"
REACT_APP_USER_SOCKET="http://localhost:3003/"
GENERATE_SOURCEMAP=false
REACT_APP_CASINO_SOCKET_URL = 'http://localhost:3025/'
REACT_APP_T10_STREAM = 'https://marketsarket.qnsports.live/virtualgames'
REACT_APP_PYTHON_SERVER='http://127.0.0.1:5000/api/'
REACT_APP_SITE_URL="http://localhost:3000/"
EOF
}

write_env_9x() {
  log "Writing .env files for brand: 9x"

  # ---- backend ----
  cat > "$ROOT/backend/.env" <<'EOF'
NODE_ENV="development"
PORT="3010"
LOG_DAYS=10
APP_MAX_UPLOAD_LIMIT="50mb"
APP_MAX_PARAMETER_LIMIT="5000"
CORS_ENABLED=true
API_PREFIX="api"
JWT_EXPIRES_IN='2h'
REDIS_QUEUE_PORT=6379
REDIS_QUEUE_HOST='localhost'
APP_NAME="Geek Dashboard"
APP_DESCRIPTION="A Web Server built with Express, Typescript, Mongoose, and Pug"
APP_URL="https://9xbro.com"
APP_KEYWORDS="web-server, typescript-express, typescript, express"
COMPANY_NAME="GeekyAnts"
SUPER_NODE_URL='https://socket2.9xbro.com/'
OD_NODE_URL="https://socket1.9xbro.com"
USER_SOCKET_URL="https://socket1.9xbro.com"
CASINO_SOCKET_URL='https://socket2.9xbro.com/'
APP_SECRET="1242#$%$^%!@@$!%*(%^metaversesolutions-metaversesolutions"
MONGOOSE_URL="mongodb+srv://infayou:JM.dHK_PpCnV7%40L@cluster0.zbf0n.mongodb.net/infa?retryWrites=true&w=majority&appName=Cluster0"
EOF

  # ---- super-node .env ----
  cat > "$ROOT/super-node/.env" <<'EOF'
PORT=3525
SITE_URL=http://localhost:3525
SUPER_NODE_URL=http://172.236.19.246:3005
REDIS_URL_REPLICA=redis://:wvGLXqhDvbPcpDv7UrnIglB@172.236.19.246:6379
REDIS_URL_SUPER_NODE_FOR_BM="redis://localhost:6379"
CASINO_SERVER=http://138.68.135.93:3007
EOF

  # ---- super-node .env.development ----
  cat > "$ROOT/super-node/.env.development" <<'EOF'
PORT=3025
SITE_URL=http://localhost:3025
SUPER_NODE_URL=http://172.236.19.246:3005
REDIS_URL_REPLICA=redis://:wvGLXqhDvbPcpDv7UrnIglB@138.68.135.93:6379
REDIS_URL_SUPER_NODE_FOR_BM=redis://:wvGLXqhDvbPcpDv7UrnIglB@138.68.135.93:6379
CASINO_SERVER=http://138.68.135.93:3007
EOF

  # ---- socket ----
  cat > "$ROOT/socket/.env" <<'EOF'
SUPER_NODE_SOCKET_URL="https://socket2.9xbro.com/"
CLIENT_NODE_URL="https://api.9xbro.com/api"
REDIS_URL_REPLICA=redis://:wvGLXqhDvbPcpDv7UrnIglB@172.236.19.246:6379
EOF

  # ---- frontend ----
  cat > "$ROOT/frontend/.env" <<'EOF'
REACT_APP_API_KEY = 'my-secret-api-key'
REACT_APP_API_BASEURL = 'http://localhost:3010/api/'
REACT_APP_API_SPORTS_URL = 'https://api.driveexch.com/api/'
REACT_APP_API_SPORTS_FANCY_URL = 'http://localhost:3025/api/'
REACT_APP_API_SOCKET_URL = 'http://localhost:3003'
REACT_APP_IP_API_URL="https://ipapi.co/json"
REACT_APP_USER_SOCKET="http://localhost:3003/"
GENERATE_SOURCEMAP=false
REACT_APP_CASINO_SOCKET_URL = 'http://localhost:3025/'
REACT_APP_T10_STREAM = 'https://marketsarket.qnsports.live/virtualgames'
REACT_APP_PYTHON_SERVER='http://127.0.0.1:5000/api/'
REACT_APP_SITE_URL="http://localhost:3000/"
EOF
}

fix_backend_tsconfig() {
  TSCONFIG="$ROOT/backend/tsconfig.json"
  # Add rootDir if missing
  if [ -f "$TSCONFIG" ]; then
    if ! grep -q '"rootDir"' "$TSCONFIG"; then
      sed -i '' 's|"outDir": "dist/".*|"outDir": "dist\/",\n    "rootDir": ".\/src",|' "$TSCONFIG"
      log "backend/tsconfig.json: added rootDir"
    fi
    # Add ignoreDeprecations if missing
    if ! grep -q '"ignoreDeprecations"' "$TSCONFIG"; then
      sed -i '' 's|"downlevelIteration": true.*|"downlevelIteration": true,\n    "ignoreDeprecations": "6.0",|' "$TSCONFIG"
      log "backend/tsconfig.json: added ignoreDeprecations"
    fi
  fi
}
