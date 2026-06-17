#!/bin/sh
set -e

if [ -n "${DATABASE_URL}" ]; then
  echo "Waiting for MySQL to be ready..."
  i=0
  until node -e "const net=require('net'); const s=net.createConnection(3306, 'mysql'); s.on('connect', () => { s.end(); process.exit(0); }); s.on('error', () => process.exit(1)); setTimeout(() => { s.destroy(); process.exit(1); }, 2000);"; do
    i=$((i + 1))
    if [ "$i" -ge 30 ]; then
      echo "MySQL did not become ready in time."
      exit 1
    fi
    sleep 2
  done

  npx prisma db push

  if [ "${SEED_DATABASE:-false}" = "true" ]; then
    npm run db:seed
  fi
else
  echo "Starting in frontend-only mode without DATABASE_URL."
fi

exec npm run start
