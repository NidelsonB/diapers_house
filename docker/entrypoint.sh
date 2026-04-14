#!/bin/sh
set -e

npx prisma db push

if [ "${SEED_DATABASE:-false}" = "true" ]; then
  npm run db:seed
fi

exec npm run start