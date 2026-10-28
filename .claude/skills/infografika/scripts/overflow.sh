#!/usr/bin/env bash
# Kontrola vodorovného přetékání na šířce mobilu (390 px).
#
# Použití: overflow.sh soubor.html [další.html …]
# Výstup:  pro každý soubor "OK" nebo seznam prvků, které přesahují viewport (sekce > značka.třída[pravý okraj]).
#          Prvky uvnitř kontejneru s overflow-x: auto/scroll/hidden se nepočítají (posouvají se ve svém rámečku).
# Návratový kód: 1, pokud něco přetéká.
set -uo pipefail

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
status=0

for f in "$@"; do
  html="$(realpath "$f")"
  cat > "$tmp/m.html" <<EOF
<!doctype html><html><body style="margin:0">
<iframe id="f" src="file://$html" style="width:390px;height:900px;border:0"></iframe>
<script>
document.getElementById('f').onload = () => setTimeout(() => {
  const d = document.getElementById('f').contentDocument;
  const W = d.documentElement.clientWidth;
  const scrolls = (e) => {
    for (let p = e.parentElement; p && p !== d.body; p = p.parentElement)
      if (/(auto|scroll|hidden)/.test(getComputedStyle(p).overflowX)) return true;
    return false;
  };
  const bad = [...d.querySelectorAll('body *')]
    .filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.right > W + 1; })
    .filter((e) => !scrolls(e));
  const where = (e) => {
    const s = e.closest('section, header, footer');
    const h = s && s.querySelector('h1, h2');
    return h ? h.textContent.trim().slice(0, 40) : (s ? s.className : '?');
  };
  document.title = bad.length
    ? 'BAD ' + bad.map((e) => where(e) + ' > ' + e.tagName.toLowerCase() + '.' + String(e.className).replace(/ /g, '.') + '[' + Math.round(e.getBoundingClientRect().right) + '/' + W + ']').join(' | ')
    : 'OK';
}, 800);
</script></body></html>
EOF
  res=$(google-chrome --headless=new --disable-gpu --no-sandbox --allow-file-access-from-files --virtual-time-budget=4000 \
        --dump-dom "file://$tmp/m.html" 2>/dev/null | grep -o '<title>[^<]*' | sed 's/<title>//; s/&gt;/>/g; s/&amp;/\&/g')
  if [[ "$res" == OK ]]; then
    echo "$(basename "$f"): OK"
  else
    status=1
    echo "$(basename "$f"): přetéká"
    echo "${res#BAD }" | tr '|' '\n' | sed 's/^ */  /'
  fi
done
exit $status
