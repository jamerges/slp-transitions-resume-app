#!/bin/sh
# Rebuild both workbook editions (docx + PDF). No LibreOffice on this Mac, so the
# PDF is the docx read back into HTML and printed by the headless Chromium that
# Playwright left in ~/Library/Caches/ms-playwright (no Playwright package needed).
#   sh scripts/workbook-render/render.sh
set -e
cd "$(dirname "$0")/../.."
CHROME=$(ls -d "$HOME"/Library/Caches/ms-playwright/chromium_headless_shell-*/chrome-mac/headless_shell 2>/dev/null | tail -1)
[ -x "$CHROME" ] || { echo "no headless Chromium under ~/Library/Caches/ms-playwright; run: npx playwright install chromium" >&2; exit 1; }
node scripts/make_course_workbook.mjs module1
node scripts/make_course_workbook.mjs full
T=$(mktemp -d)
for ed in transition-os-workbook-module1 transition-os-workbook; do
  python3 scripts/workbook-render/docx2html.py "content/course/workbook/$ed.docx" "$T/$ed.html" print
  "$CHROME" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="$PWD/content/course/workbook/$ed.pdf" "file://$T/$ed.html" 2>/dev/null
  echo "pdf: content/course/workbook/$ed.pdf"
done
