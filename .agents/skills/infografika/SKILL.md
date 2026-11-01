---
name: infografika
description: Vytvoření nebo úprava infografiky k lekci todo-rs (journal/infografika/NN-…-infografika.html) – jednotný styl řady, metafora, scény, interaktivní hřiště, ověření kódu na rustc a kontrola vzhledu screenshoty. Použít vždy při zápisu nové lekce a když student chce infografiku upravit.
---

# Infografika k lekci

Ke každé lekci patří jedna samostatná HTML stránka v `journal/infografika/`, která lekci vysvětlí
obrázky a nechá si ji „osahat“ na hřišti. Je to doplněk textu lekce, ne jeho náhrada.

## Postup

1. **Podklady:** přečti `journal/NN-….md` celé a kód na tagu `git show lekce-NN:src/main.rs`.
   Infografika vychází ze **skutečného kódu studenta** a nepředbíhá pozdější lekce (odkáže na ně
   jen tam, kde to dělá i text lekce).
2. **Metafora:** jedna pro celou lekci, fyzická a jednoduchá (lekce 05 krabice a štítky, 04 třídička
   a žetony, 06 cesta textu a řada branek). Vede přes všechny scény.
3. **Soubor:** `journal/infografika/NN-kratky-nazev-infografika.html`. Jako šablonu zkopíruj
   `<head>`, CSS tokeny a základní třídy z `06-vstup-infografika.html` (nejnovější a nejčistší),
   pak přidej třídy specifické pro metaforu.
4. **Ověř** kód, hlášky i vzhled (níže), oprav, co najdeš.
5. **Ferris u taháku:** do pole `LESSONS` ve `scripts/ferris-tahak.js` přidej lekci: předmět z metafory (SVG v rámečku
   x 70–130, y 8–48), jeho název ve 4. pádu a radu na jeden řádek. Skript vytvoří `journal/ferris/tahak-NN.svg` a doplní Ferrise
   pod nadpis Tahák v lekci i infografice. Když kopíruješ šablonu z jiné infografiky, Ferrise z ní smaž, skript pozná hotovou
   stránku podle textu „Ferris radí“.
6. **Odkazy:** do sekce `## Odkazy` lekce jako první položku
   `- [Infografika: <Titulek>](infografika/<soubor>.html) – <co v ní je> + hřiště … (otevřít v prohlížeči)`
   a stejný řádek odsazeně (`  - …`) pod lekci v `journal/README.md`.
   V patičce infografiky odkaz na text lekce vede o adresář výš: `../NN-….md`.
   Hned na začátku `.wrap` je navigace ze šablony: zpět na lekci, obsah a GitHub. Na konci stránky musí zůstat krátký skript
   ze šablony, který odkazy na `.md` na GitHub Pages přepíše (`README.md` na adresář, ostatní na `.html`).

## Struktura stránky

1. **Hero:** eyebrow `todo-rs · lekce NN · téma`, `<h1>` = titulek (2–4 slova, stejný jako `<title>`),
   lead s metaforou, vpravo malý obrázek metafory.
2. **3 pravidla** (`.rules`), krátká a zapamatovatelná.
3. **Číslované scény** (`.scene`): vlevo `.fig` (obrázek z HTML/CSS/inline SVG + `.fig-cap`), vpravo
   `.text` (věta s metaforou `.metaphor`, kód v `<pre>`, vysvětlení syntaxe, `.verdict` s chybou).
   V nadpisu scény má být klíčové slovo (`<h2><code>if let</code>: …</h2>`), ne jen metafora –
   jinak se v infografice nedá najít.
4. **Hřiště** (`.play`): interaktivní simulace nad kódem studenta – hodnoty/příkazy na kliknutí,
   vidět mezistavy, proměnné, výstup terminálu a **hlášky kompilátoru**, když něco nejde.
   Simulace se musí chovat jako skutečný program (stejné texty výstupu).
5. **Tahák** (Ferris s radou, `table.cheat`) a tabulka chyb / „co se pokazí“.
6. **Footer:** odkaz na text lekce (`../…md`), Rust Book, std dokumentace.

Jazyk: česky, identifikátory anglicky. Rozebírat **každý symbol syntaxe** (jak se čte, s čím
nezaměnit), stejně jako v lekcích.

## Styl (jednotná řada)

- Barvy jen přes tokeny na `:root` (`--bg`, `--surface`, `--ink`, `--muted`, `--line`, `--kraft*`,
  `--tape`, `--label`, `--read*`, `--write*`, `--ok*`, `--err*`), tmavý režim přes
  `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {…} }` + `:root[data-theme="dark"]`.
- Písma: Bricolage Grotesque (nadpisy), Atkinson Hyperlegible Next (text), JetBrains Mono (kód),
  Saira Stencil One (čísla scén, razítka).
- **Vypnuté ligatury** na `body`: `font-variant-ligatures: none; font-feature-settings: "calt" 0, "liga" 0;`
  – jinak JetBrains Mono kreslí `=>`, `->`, `&&` jako šipky a začátečník neví, co psát.
- Bez externích skriptů, vše v jednom souboru.

## Ověření (skripty v `scripts/`)

| Skript | Co dělá |
|---|---|
| `scripts/rustc-check.sh soubor.rs` nebo `- <<'EOF' … EOF` | přeloží ukázku `rustc --edition 2024`, vypíše hlavičky chyb (`error[E0384]: …`) a celý výpis; když se přeloží, spustí a vypíše výstup / paniku |
| `scripts/overflow.sh journal/infografika/*.html` | najde prvky přetékající na šířce mobilu 390 px (exit 1, pokud něco přetéká) |
| `scripts/shot.sh soubor.html [adresář]` | screenshot na 1200 a 390 px rozřezaný na dílky ≤ 2000 px; dílky prohlédni nástrojem Read |
| `node scripts/ferris-tahak.js` | vygeneruje Ferrise (`journal/ferris/`) a doplní ho k tahákům, kde ještě není; hotové stránky nechá být |
| `scripts/playtest.sh soubor.html test.js` | spustí stránku s testovacím skriptem (klikání na hřišti), výsledek z `document.title` |

Skripty potřebují `google-chrome` a Python s PIL. Výstupy dávej do scratchpadu, ne do repa.

Každou hlášku kompilátoru, výstup programu, `dbg!`, `cargo` nebo `git`, kterou infografika cituje,
ověř skutečným spuštěním. Nic nepiš zpaměti.

## Ferris

Kresba je v `scripts/ferris.js`, používá ji i kvíz. Tmavý režim řeší sama, barvy jsou pevné. `journal/ferris/ferris.svg` v obsahu
drží oficiální logo Rustu z `assets/rust-logo-blk.svg`: © Rust Foundation, CC-BY, smí se použít jen **beze změny** (žádné
překreslování, přebarvování ani zakrývání) a s uvedením autora, které je v `journal/README.md`. Nesmí to vypadat jako oficiální projekt Rustu.

## Pasti, na které jsme narazili

- **Headless Chrome a šířka:** `--window-size=390,…` vykreslí ve skutečnosti ~485–500 px (minimum
  okna) a přetékání na mobilu není vidět. Měřit vždy přes `<iframe>` s přesnou šířkou (dělají to
  `shot.sh` a `overflow.sh`). Iframe s `file://` potřebuje `--allow-file-access-from-files`.
- **Grid a dlouhý kód:** položky gridu mají `min-width: auto`, takže nezalomitelný `<code>`
  (`white-space: nowrap`) roztáhne celý sloupec. Sloupce psát `minmax(0, 1fr)`, `.text > * { min-width: 0 }`
  a na mobilu povolit zalomení inline kódu (`white-space: normal; overflow-wrap: anywhere`).
- **`scrollIntoView` při načtení** posune celou stránku dolů k hřišti (a screenshot je prázdný).
  Log hřiště posouvat jen `logEl.scrollTop = logEl.scrollHeight`.
- **Řady „branek“ / flex s `min-width`** v úzkém sloupci (hero, trace hřiště) přetékají – tam dát
  `min-width: 0` nebo `flex-direction: column`.
- **Ukázky mezer** v tlačítkách: mezery v `<code>` se slijí; v popiscích použít `·` a vysvětlit
  („· = mezera“).
