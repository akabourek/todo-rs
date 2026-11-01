#!/usr/bin/env bash
# Ověření ukázky kódu a hlášky kompilátoru na skutečném rustc (edice 2024).
#
# Použití: rustc-check.sh ukazka.rs
#          rustc-check.sh - <<'EOF'
#          fn main() { let x = 5; x = 6; }
#          EOF
# Výstup: hlavičky chyb a varování (error[E0384]: …), pak celý výpis kompilátoru.
#         Když se kód přeloží, program se spustí a vypíše se jeho výstup (včetně paniky).
set -uo pipefail

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
if [[ "${1:--}" == - ]]; then cat > "$tmp/main.rs"; else cp "$1" "$tmp/main.rs"; fi

if rustc --edition 2024 -o "$tmp/main" "$tmp/main.rs" 2> "$tmp/err.txt"; then
  if [[ -s "$tmp/err.txt" ]]; then
    echo "== varování =="
    grep -E '^warning' "$tmp/err.txt"
  fi
  echo "== přeloženo, výstup programu =="
  (cd "$tmp" && timeout 5 ./main 2>&1) | sed "s#$tmp/##g"
  code=${PIPESTATUS[0]}
  echo "== návratový kód: $code ==" 
else
  echo "== hlavičky =="
  grep -E '^(error|warning)' "$tmp/err.txt"
  echo "== celý výpis =="
  sed "s#$tmp/##g" "$tmp/err.txt"
fi
