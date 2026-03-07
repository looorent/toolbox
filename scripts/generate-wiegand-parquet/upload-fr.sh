#!/usr/bin/env bash
set -euo pipefail

BUCKET="anpr-wiegand26-registry"
COUNTRY="FR"
ENDPOINT="https://${TOOLBOX_CF_ACCOUNT_ID}.r2.cloudflarestorage.com"
OUTPUT_DIR="$(dirname "$0")/output"
CONCURRENCY=6

if [[ -z "${TOOLBOX_CF_ACCOUNT_ID:-}" || -z "${TOOLBOX_CF_R2_ACCESS_KEY_ID:-}" || -z "${TOOLBOX_CF_R2_SECRET_ACCESS_KEY:-}" ]]; then
  echo "Error: Set TOOLBOX_CF_ACCOUNT_ID, TOOLBOX_CF_R2_ACCESS_KEY_ID, and TOOLBOX_CF_R2_SECRET_ACCESS_KEY" >&2
  exit 1
fi

export AWS_ACCESS_KEY_ID="$TOOLBOX_CF_R2_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="$TOOLBOX_CF_R2_SECRET_ACCESS_KEY"

files=("$OUTPUT_DIR"/*_${COUNTRY}_wiegand_to_text.parquet)

if [[ ${#files[@]} -eq 0 ]]; then
  echo "No ${COUNTRY} parquet files found in ${OUTPUT_DIR}" >&2
  exit 1
fi

echo "Uploading ${#files[@]} ${COUNTRY} file(s) to s3://${BUCKET}/${COUNTRY}/ (${CONCURRENCY} concurrent)"

printf '%s\n' "${files[@]}" | xargs -P "$CONCURRENCY" -I {} bash -c '
  file="$1"
  key="'"$COUNTRY"'/$(basename "$file")"
  aws s3 cp "$file" "s3://'"$BUCKET"'/$key" \
    --endpoint-url "'"$ENDPOINT"'" \
    --region auto \
    --no-progress
  echo "  Uploaded $key"
' _ {}

echo "Done."
