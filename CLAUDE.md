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
  2. **Nové pojmy** – krátké vysvětlení s mini-příklady
  3. **Postup** – co jsme udělali, příkazy, klíčové kusy kódu
  4. **Tahák** – shrnutí v bodech / tabulce
  5. **Procvičení** – 2–3 malé úkoly pro samostatnou práci
  6. **Odkazy** – kapitoly z The Rust Book apod.
- Lekce popisuje stav kódu odpovídající git tagu `lekce-NN`.

## Kdo co dělá

- **Zdrojové soubory (`src/**`, později `*.rs` kdekoliv) píše Aleš sám.** Claude do nich nezapisuje.
  Výjimka jen na Alešův výslovný pokyn pro konkrétní změnu.
- Claude: vysvětluje pojmy, zadává úkoly, kontroluje kód (build, clippy, testy), radí s chybami,
  píše journal, udržuje CLAUDE.md, dělá git commity a tagy. `Cargo.toml` (závislosti) může Claude
  upravit, ale lepší je ukázat příkaz (`cargo add ...`) a nechat Aleše ho spustit.
- U chyb dávat nejdřív **nápovědu** (co kompilátor říká a proč), hotové řešení až když o něj Aleš požádá.

## Postup u každé lekce

1. Claude vysvětlí nové pojmy a zadá, co má Aleš napsat (malý krok, jeden okruh pojmů).
2. Aleš napíše kód.
3. Claude ověří: `cargo build`, `cargo run`, `cargo clippy`, od lekce s testy i `cargo test`;
   okomentuje kód, navrhne vylepšení.
4. Claude napíše lekci do `journal/` podle skutečného Alešova kódu, aktualizuje `journal/README.md`
   a stav osnovy níže.
5. Commit (česká zpráva) + tag `lekce-NN`.

## Technické volby

- Rust 1.95, edition 2024, jeden Cargo projekt (binárka `todo`), později rozdělení na workspace
  (`todo-core` knihovna + CLI/TUI/GUI binárky) – samotné rozdělení je lekce.
- TUI: `ratatui` + `crossterm`.
- GUI: `egui` / `eframe` (immediate mode, nejjednodušší start). `iced` jen jako volitelné srovnání.
- Ukládání: `serde` + `serde_json`. CLI argumenty: `clap`.

## Osnova (stav: ✅ hotovo, ⬜ čeká)

### Část I – Základy (konzole)
- ✅ 00 Příprava prostředí (rustup, cargo, git, editor)
- ⬜ 01 První program (println!, proměnné, mut, Vec, for)
- ⬜ 02 Struktury a metody (`struct Task`, `impl`, `String` vs `&str`)
- ⬜ 03 Enumy a `match` (stav úkolu, `Option`)
- ⬜ 04 Vlastnictví a výpůjčky (ownership, borrowing, `&` / `&mut`)
- ⬜ 05 Vstup od uživatele (stdin, interaktivní smyčka, parsování příkazů)
- ⬜ 06 Chyby (`Result`, `?`, vlastní chybový typ)
- ⬜ 07 Moduly (rozdělení do souborů, `pub`, `mod`, `use`)
- ⬜ 08 Testy (`cargo test`, unit testy)
- ⬜ 09 Ukládání do souboru (crates, `serde`, JSON, `std::fs`)
- ⬜ 10 CLI argumenty (`clap`, `todo add "..."`)

### Část II – Pokročilejší Rust
- ⬜ 11 Traity a generika
- ⬜ 12 Iterátory a closures (filtrování, řazení úkolů)
- ⬜ 13 Lifetimes
- ⬜ 14 Workspace: knihovna `todo-core` + binárky

### Část III – TUI
- ⬜ 15 ratatui: první okno, event loop
- ⬜ 16 Stav aplikace, seznam, navigace klávesami
- ⬜ 17 Přidávání/editace úkolů, režimy (normal/insert)

### Část IV – GUI
- ⬜ 18 egui/eframe: první okno
- ⬜ 19 ToDo GUI nad `todo-core`
- ⬜ 20 Release build, distribuce, (volitelně) srovnání s iced
