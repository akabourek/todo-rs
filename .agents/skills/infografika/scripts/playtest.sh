#!/usr/bin/env bash
# Test hřiště: vloží do kopie stránky testovací skript, spustí ji v headless Chromu a vypíše výsledek.
#
# Použití: playtest.sh soubor.html test.js
# test.js běží po skriptu stránky (vloží se před </body>). Výsledek zapiš do document.title, např.:
#
#   const ex = [...document.querySelectorAll('#examples button')];
#   ex.find((b) => b.title === 'done 99').click();
#   document.title = document.getElementById('term').innerText;
#
# Výstup: obsah <title> po doběhnutí (odřádkování nahrazena " | ").
set -euo pipefail

html="$(realpath "$1")"
test_js="$(realpath "$2")"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

python3 - "$html" "$test_js" "$tmp/page.html" <<'PY'
import sys
html, js, out = sys.argv[1:]
page = open(html, encoding='utf-8').read()
test = open(js, encoding='utf-8').read()
wrapped = "<script>\ntry {\n" + test + "\n} catch (e) { document.title = 'TEST ERROR: ' + e; }\n</script>\n"
assert '</body>' in page, 'stránka nemá </body>'
i = page.rindex('</body>')
open(out, 'w', encoding='utf-8').write(page[:i] + wrapped + page[i:])
PY

google-chrome --headless=new --disable-gpu --no-sandbox --virtual-time-budget=3000 --dump-dom "file://$tmp/page.html" 2>/dev/null \
  | python3 -c "
import sys, re, html
m = re.search(r'<title>(.*?)</title>', sys.stdin.read(), re.S)
print(html.unescape(m.group(1)).replace('\n', ' | ') if m else 'bez <title>')
"
