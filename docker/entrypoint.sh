#!/bin/sh
set -e

echo "Waiting for MySQL to be ready..."
i=0
until mysqladmin ping -h mysql -u"${MYSQL_USER:-diapers_user}" -p"${MYSQL_PASSWORD}" --silent; do
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

exec npm run start
