#!/bin/sh
# Print both blank workbook editions and the two kit sheets as PDFs, with the
# headless Chromium that Playwright left in ~/Library/Caches/ms-playwright (no
# Playwright package needed). The .docx editions are the September design and are
# no longer rebuilt or linked.
#   sh scripts/workbook-render/render.sh
set -e
cd "$(dirname "$0")/../.."
CHROME=$(ls -d "$HOME"/Library/Caches/ms-playwright/chromium_headless_shell-*/chrome-mac/headless_shell 2>/dev/null | tail -1)
[ -x "$CHROME" ] || { echo "no headless Chromium under ~/Library/Caches/ms-playwright; run: npx playwright install chromium" >&2; exit 1; }
# Since 2026-11-15 the blank workbooks are the workbook page itself, printed with
# nothing filled in (components/course/workbook-model.ts is the one source). The
# dev server has to be running: the page takes ?as=os|ground in development only,
# because a headless browser has no access cookie.
BASE=${WORKBOOK_BASE:-http://localhost:3000}
curl -s -o /dev/null -m 20 "$BASE/api/prices" || { echo "start the dev server first ($BASE is not answering)" >&2; exit 1; }
for pair in "ground:transition-os-workbook-module1" "os:transition-os-workbook"; do
  as=${pair%%:*}; ed=${pair#*:}
  "$CHROME" --headless --disable-gpu --no-pdf-header-footer --virtual-time-budget=15000 --print-to-pdf="$PWD/content/course/workbook/$ed.pdf" "$BASE/course/workbook?blank=1&as=$as" 2>/dev/null
  echo "pdf: content/course/workbook/$ed.pdf"
done
# The two kit sheets (2026-09-21): static HTML in scripts/kit-sheets, printed the same way.
for f in kit-translation-pass kit-who-first; do
  "$CHROME" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="$PWD/content/course/workbook/$f.pdf" "file://$PWD/scripts/kit-sheets/$f.html" 2>/dev/null
  echo "pdf: content/course/workbook/$f.pdf"
done
