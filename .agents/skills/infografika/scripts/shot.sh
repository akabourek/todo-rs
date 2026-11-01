#!/usr/bin/env bash
# Screenshot infografiky na desktopu (1200 px) a mobilu (390 px), rozřezaný na dílky k prohlédnutí.
#
# Použití: shot.sh soubor.html [výstupní-adresář]
# Výstup:  cesty k PNG dílkům (výška max. 2000 px), seřazené shora dolů.
#
# Stránka se načítá v <iframe> s přesnou šířkou: okno headless Chromu má minimální šířku ~500 px,
# takže --window-size=390 by ve skutečnosti vykreslil širší stránku a přetékání by nebylo vidět.
set -euo pipefail

html="$(realpath "$1")"
out="${2:-${TMPDIR:-/tmp}/infografika-shots}"
mkdir -p "$out"
name="$(basename "$html" .html)"
chrome=(google-chrome --headless=new --disable-gpu --no-sandbox --hide-scrollbars --allow-file-access-from-files)

for w in 1200 390; do
  frame="$out/$name-frame-$w.html"
  cat > "$frame" <<EOF
<!doctype html><html><body style="margin:0">
<iframe id="f" src="file://$html" style="width:${w}px;height:1000px;border:0;display:block"></iframe>
<script>
document.getElementById('f').onload = () => setTimeout(() => {
  document.title = 'H=' + document.getElementById('f').contentDocument.documentElement.scrollHeight;
}, 800);
</script></body></html>
EOF
  # 1. změřit výšku stránky
  h=$("${chrome[@]}" --virtual-time-budget=4000 --dump-dom "file://$frame" 2>/dev/null | grep -o 'H=[0-9]*' | cut -d= -f2 || true)
  h=${h:-8000}
  (( h > 16000 )) && h=16000
  sed -i "s/height:1000px/height:${h}px/" "$frame"

  # 2. vyfotit celou stránku
  win=$(( w < 500 ? 500 : w ))
  "${chrome[@]}" --virtual-time-budget=4000 --window-size="$win,$h" --screenshot="$out/$name-$w.png" "file://$frame" 2>/dev/null

  # 3. oříznout na šířku a rozřezat
  python3 - "$out/$name-$w.png" "$w" <<'PY'
import sys
from PIL import Image
path, w = sys.argv[1], int(sys.argv[2])
im = Image.open(path)
im = im.crop((0, 0, w, im.size[1]))
step = 2000
for i, top in enumerate(range(0, im.size[1], step)):
    piece = path.replace('.png', f'-{i}.png')
    im.crop((0, top, w, min(top + step, im.size[1]))).save(piece)
    print(piece)
PY
done
