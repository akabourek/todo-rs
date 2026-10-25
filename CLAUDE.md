# todo-rs – výukový projekt Rustu

## Účel

Aleš se na tomto projektu učí desktopový Rust **od úplných začátků**. Aplikace je ToDo list, který postupně roste:
konzolový program → CLI s ukládáním → TUI (terminálové UI) → GUI aplikace. Každá lekce přidá jednu věc
a naučí jeden okruh Rustu. Kód slouží výuce – srozumitelnost má přednost před chytrostí.

## Jazyk

- Komunikace, journal, komentáře v kódu a commit zprávy: **česky**.
- Identifikátory v kódu (proměnné, funkce, typy): **anglicky** (idiomatický Rust).

## Journal (učebnice)

- Adresář `journal/`, jeden soubor na lekci: `NN-kratky-nazev.md` (např. `01-prvni-program.md`).
- `journal/README.md` = obsah s odkazy na všechny lekce. Po každé lekci aktualizovat.
- Struktura každé lekce (stručně, aby se k ní dalo vracet jako k taháku):
  1. **Cíl** – 1–2 věty, co umíme po lekci
  2. **Nové pojmy a syntaxe** – krátké vysvětlení s mini-příklady; rozebrat i každý nový zápis
     (symboly jako `|x|`, `&`, `::`, `!`, `?`, `'a`…), ne jen koncept
  3. **Postup** – co jsme udělali, příkazy, klíčové kusy kódu
  4. **Tahák** – shrnutí v bodech / tabulce
  5. **Procvičení** – 2–3 malé úkoly pro samostatnou práci
  6. **Odkazy** – kapitoly z The Rust Book apod.
- Lekce popisuje stav kódu odpovídající git tagu `lekce-NN`.

## Kdo co dělá

- **Claude nedělá nic za Aleše.** Aleš se učí tím, že věci dělá sám. Claude nic nevytváří, neupravuje,
  nemaže ani nespouští za něj – bez výslovného pokynu pro konkrétní akci. Ani „na pomoc“, ani podle
  vlastního výkladu Alešovy otázky; když není jasné, co chce, Claude se zeptá a počká.
- **Všechny soubory projektu vytváří a upravuje Aleš sám**: zdrojáky (`*.rs`), `Cargo.toml`,
  konfigurace (`.vscode/`, `.gitignore`, `rustfmt.toml`…), i příkazy, které něco mění (`cargo add`, `cargo fmt`…).
  Claude místo toho řekne, co a kde udělat (návod, ne hotový soubor).
- Claude sám zapisuje **jen** do `journal/` a `CLAUDE.md`. Git commit/tag dělá, když o to Aleš požádá.
- Claude: vysvětluje pojmy, zadává úkoly, kontroluje kód (build, clippy, testy – jen čtení/ověření),
  radí s chybami.
- **Vždy vysvětlovat i syntaxi a jazykové konstrukce**, nejen co kód dělá. Každý nový symbol
  nebo zápis (např. `|x|` u closure, `&`, `::`, `!` u maker, destrukturování `(a, b)`) rozebrat:
  co znamená, jak se čte, s čím ho nezaměnit. Nepředpokládat, že Aleš zná zápis z jiného jazyka.
- U chyb dávat nejdřív **nápovědu** (co kompilátor říká a proč), hotové řešení až když o něj Aleš požádá.

## Postup u každé lekce

1. Claude vysvětlí nové pojmy a zadá, co má Aleš napsat (malý krok, jeden okruh pojmů).
2. Aleš napíše kód.
3. Claude ověří: `cargo build`, `cargo run`, `cargo clippy`, od lekce s testy i `cargo test`;
   okomentuje kód, navrhne vylepšení.
4. Claude napíše lekci do `journal/` podle skutečného Alešova kódu, aktualizuje `journal/README.md`
   a stav osnovy níže.
5. Na Alešův pokyn: commit (česká zpráva) + tag `lekce-NN`.

## Technické volby

- Rust 1.95, edition 2024, jeden Cargo projekt (binárka `todo`), později rozdělení na workspace
  (`todo-core` knihovna + CLI/TUI/GUI binárky) – samotné rozdělení je lekce.
- TUI: `ratatui` + `crossterm`.
- GUI: `egui` / `eframe` (immediate mode, nejjednodušší start). `iced` jen jako volitelné srovnání.
- Ukládání: `serde` + `serde_json`. CLI argumenty: `clap`.

## Osnova (stav: ✅ hotovo, ⬜ čeká)

### Část I – Základy (konzole)
- ✅ 00 Příprava prostředí (rustup, cargo, git, editor)
- ✅ 01 První program (println!, proměnné, mut, pole vs Vec, for, closure `|x|`)
- ✅ 02 Debugování ve VS Code (CodeLLDB, breakpointy, krokování, `dbg!`, format on save)
- ✅ 03 Struktury a metody (`struct Task`, `impl`, `String` vs `&str`)
- ✅ 04 Enumy a `match` (stav úkolu, `Option`)
- ✅ 05 Vlastnictví a výpůjčky (ownership, borrowing, `&` / `&mut`)
- ⬜ 06 Vstup od uživatele (stdin, interaktivní smyčka, parsování příkazů)
- ⬜ 07 Chyby (`Result`, `?`, vlastní chybový typ)
- ⬜ 08 Moduly (rozdělení do souborů, `pub`, `mod`, `use`)
- ⬜ 09 Testy (`cargo test`, unit testy)
- ⬜ 10 Ukládání do souboru (crates, `serde`, JSON, `std::fs`)
- ⬜ 11 CLI argumenty (`clap`, `todo add "..."`)

### Část II – Pokročilejší Rust
- ⬜ 12 Traity a generika
- ⬜ 13 Iterátory a closures (filtrování, řazení úkolů)
- ⬜ 14 Lifetimes
- ⬜ 15 Workspace: knihovna `todo-core` + binárky

### Část III – TUI
- ⬜ 16 ratatui: první okno, event loop
- ⬜ 17 Stav aplikace, seznam, navigace klávesami
- ⬜ 18 Přidávání/editace úkolů, režimy (normal/insert)

### Část IV – GUI
- ⬜ 19 egui/eframe: první okno
- ⬜ 20 ToDo GUI nad `todo-core`
- ⬜ 21 Release build, distribuce, (volitelně) srovnání s iced
