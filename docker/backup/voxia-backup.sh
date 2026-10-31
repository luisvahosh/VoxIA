#!/usr/bin/env bash
# Daily VoxIA backup: Postgres, uploaded files and .env, encrypted with age
# before they leave the server. Bucket lifecycle and Object Lock handle
# retention, so this script never deletes anything remotely.
set -euo pipefail

VOXIA_DIR="${VOXIA_DIR:-/root/voxia}"
AGE_RECIPIENT_FILE="${AGE_RECIPIENT_FILE:-/root/voxia-backup/age.pub}"
REMOTE="${REMOTE:-voxia-b2:voxia-respaldos}"

stamp="$(date -u +%Y-%m-%d_%H%M)"
work_dir="$(mktemp -d /root/voxia-backup/tmp.XXXXXX)"
trap 'rm -rf "$work_dir"' EXIT

cd "$VOXIA_DIR"

encrypt() {
  age -R "$AGE_RECIPIENT_FILE" -o "$1"
}

docker compose -f docker-compose.prod.yml exec -T postgres sh -c \
  'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' \
  | encrypt "$work_dir/postgres.dump.age"

docker run --rm -v voxia_filesystem-data:/from:ro alpine tar -C /from -czf - . \
  | encrypt "$work_dir/filesystem.tar.gz.age"

encrypt "$work_dir/env.age" < .env

for file in "$work_dir"/*.age; do
  rclone copyto --no-check-dest "$file" "$REMOTE/$stamp/$(basename "$file")"
done

echo "$(date -u +%FT%TZ) backup OK: $stamp"
