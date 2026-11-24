#!/bin/sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
AUDIT="$ROOT/tools/minitool-zip-builder/scripts/audit_artifact.py"
OUT="$ROOT/dist"
mkdir -p "$OUT"

pack_one() {
  name=$1
  src=$2
  zip=$OUT/$name.zip
  rm -f "$zip"
  python3 "$AUDIT" "$src"
  (
    cd "$src"
    zip -r -X "$zip" . -x '*.DS_Store' -x '__MACOSX/*'
  )
  python3 "$AUDIT" "$zip"
  if ! unzip -Z1 "$zip" | grep -qx 'index.html'; then
    echo "ERROR: $name zip 根目录没有 index.html" >&2
    exit 1
  fi
  if unzip -Z1 "$zip" | grep -q '/'; then
    :
  fi
  echo "ZIP $name $(wc -c < "$zip") bytes"
}

pack_one songci-color "$ROOT/apps/songci-color/pkg"
pack_one songchao-quiz "$ROOT/apps/songchao-quiz/pkg"
pack_one song-wardrobe "$ROOT/apps/song-wardrobe/pkg"
