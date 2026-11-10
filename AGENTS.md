# todo-rs – výukový projekt Rustu

Pravidla pro AI agenty, kteří s tímto projektem pracují. Platí stejně pro každého agenta.

## Účel

Student se na tomto projektu učí desktopový Rust **od úplných začátků**. Aplikace je ToDo list, který postupně roste:
konzolový program → CLI s ukládáním → TUI (terminálové UI) → GUI aplikace. Každá lekce přidá jednu věc
a naučí jeden okruh Rustu. Kód slouží výuce – srozumitelnost má přednost před chytrostí.

## Student a znovupoužitelnost

Projekt je znovupoužitelný: kdokoli si ho může naklonovat a projít od lekce 00 (návod je v `README.md`).
**Student** je ten, kdo s agentem právě pracuje. Hotové lekce v `journal/` vznikly při původním průchodu projektem
a popisují jeho kód.

Jde o **nového studenta**, když chybí `src/`, když existuje `journal/student/stav.md`, nebo když to sám řekne.
Jinak jde o autora učebnice, který píše další lekci podle osnovy, a tato sekce se neuplatní. Pro nového studenta platí:

- **Průběh:** Agent ho vede v `journal/student/stav.md` (hotové lekce, kde student skončil). Při prvním setkání
  soubor založí. Značky ✅ v osnově níže říkají, které lekce už v učebnici jsou, ne co má student hotové. Začíná se lekcí 00, pokud student
  neřekne jinak.
- **Hotové lekce jsou učebnice:** lekce a infografiky, které už v `journal/` jsou, se nepřepisují. Agent z nich učí,
  ale zadání a kontrolu přizpůsobuje skutečnému kódu studenta. Formulace „tvoje chyba“ v nich popisují chyby z původního průchodu.
- **Krok 4 postupu:** u lekce, která v `journal/` už je, se zápis, infografika ani otázky do kvízu nedělají, jen se aktualizuje `stav.md`.
  Lekci, která v `journal/` chybí, agent sepíše běžným postupem.
- **Tagy:** `lekce-NN` v klonu už existují a ukazují kód učebnice, nový student používá `student-NN`.
  Porovnání: `git diff lekce-03 student-03`.

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
  4. **Tahák** – shrnutí v bodech / tabulce; pod nadpisem je Ferris s předmětem z metafory lekce a krátkou radou
     (skript `ferris-tahak.js` ze skillu `infografika`)
  5. **Procvičení** – 2–3 malé úkoly pro samostatnou práci
  6. **Odkazy** – kapitoly z The Rust Book apod.
- Lekce popisuje stav kódu odpovídající git tagu `lekce-NN`.
- Pod nadpisem a na konci každé lekce je stejný řádek s navigací: předchozí lekce, `[Obsah](README.md)`, další lekce a odkaz
  na GitHub. Po přidání nové lekce doplnit odkaz na ni i do lekce předchozí. `journal/README.md` odkazuje na GitHub pod nadpisem.
- Lekce (`*.md`) překládá na webu (GitHub Pages) Jekyll. Ukázky kódu se tam musí zobrazit přesně tak, jak jsou ve zdroji,
  proto v lekcích dbát na znaky, které má Jekyll vyhrazené:
  - `{{` a `{%` jsou značky šablon Liquid a zpracují se **i uvnitř kódu**. Text se tiše ztratí nebo selže sestavení webu. Rust je
    používá např. v `format!("{{}}")`, takový kód obalit do `{% raw %}` … `{% endraw %}`.
  - `{:` mimo kód může kramdown považovat za své atributy, `{:?}` proto psát jen v kódu.
  - Před tabulkou musí být prázdný řádek a svislítko v kódu uvnitř tabulky se píše `<code>a &#124;&#124; b</code>`
    (zápis `\|` by se zobrazil doslova).
  - Infografiky (`*.html`) bez front matter Jekyll jen kopíruje, tyto zásady se jich netýkají.

## Infografiky

- **Ke každé lekci patří infografika** – agent ji vytvoří vždy spolu se zápisem lekce (krok 4 postupu).
- Umístění: `journal/infografika/NN-kratky-nazev-infografika.html` (jeden samostatný HTML soubor,
  otevírá se v prohlížeči), odkaz v sekci **Odkazy** lekce i v `journal/README.md`.
- Každá infografika má hned nahoře navigaci zpět na svou lekci, na obsah a na GitHub.
- Postup, struktura, jednotný styl řady, pasti a ověřovací skripty jsou ve skillu
  **`infografika`** (`.agents/skills/infografika/SKILL.md`, skripty v `scripts/`):
  `rustc-check.sh` (ukázky a hlášky na skutečném `rustc`), `overflow.sh` (přetékání na mobilu),
  `shot.sh` (screenshoty desktop/mobil), `playtest.sh` (test hřiště). Při tvorbě infografiky skill vždy načíst.

## Kvíz

- `journal/kviz/kviz.html` je **jeden kvíz, který roste s lekcemi**: ke každé nové lekci agent doplní otázky (krok 4 postupu).
  Adresa se nemění, vede na ni i Ferris v obsahu.
- Stránka se nepíše ručně, skládá se z `questions.js` a `template.html`. Postup, zásady pro otázky a ověření na `rustc` jsou
  ve skillu **`kviz`** (`.agents/skills/kviz/SKILL.md`). Při přidávání otázek skill vždy načíst.

## Kdo co dělá

- **Agent nedělá nic za studenta.** Student se učí tím, že věci dělá sám. Agent nic nevytváří, neupravuje,
  nemaže ani nespouští za něj – bez výslovného pokynu pro konkrétní akci. Ani „na pomoc“, ani podle
  vlastního výkladu studentovy otázky; když není jasné, co chce, agent se zeptá a počká.
- **Všechny soubory projektu vytváří a upravuje student sám**: zdrojáky (`*.rs`), `Cargo.toml`,
  konfigurace (`.vscode/`, `.gitignore`, `rustfmt.toml`…), i příkazy, které něco mění (`cargo add`, `cargo fmt`…).
  Agent místo toho řekne, co a kde udělat (návod, ne hotový soubor).
- Agent sám zapisuje **jen** do `journal/` (včetně `journal/infografika/`), `AGENTS.md`
  a svých pomocných nástrojů v `.agents/skills/` (skilly a skripty pro psaní journalu, infografik a kvízu). Git commit/tag dělá, když o to student požádá.
- Agent: vysvětluje pojmy, zadává úkoly, kontroluje kód (build, clippy, testy – jen čtení/ověření),
  radí s chybami.
- **Vždy vysvětlovat i syntaxi a jazykové konstrukce**, nejen co kód dělá. Každý nový symbol
  nebo zápis (např. `|x|` u closure, `&`, `::`, `!` u maker, destrukturování `(a, b)`) rozebrat:
  co znamená, jak se čte, s čím ho nezaměnit. Nepředpokládat, že student zná zápis z jiného jazyka.
- U chyb dávat nejdřív **nápovědu** (co kompilátor říká a proč), hotové řešení až když o něj student požádá.

## Postup u každé lekce

1. Agent vysvětlí nové pojmy a zadá, co má student napsat (malý krok, jeden okruh pojmů).
2. Student napíše kód.
3. Agent ověří: `cargo build`, `cargo run`, `cargo clippy`, od lekce s testy i `cargo test`;
   okomentuje kód, navrhne vylepšení.
4. Agent napíše lekci do `journal/` podle skutečného kódu studenta, vytvoří k ní infografiku
   v `journal/infografika/`, doplní Ferrise k taháku a otázky do kvízu, aktualizuje `journal/README.md` a stav osnovy níže.
5. Na pokyn studenta: commit (česká zpráva) + tag `lekce-NN` (nový student `student-NN`).

## Technické volby

- Rust 1.95, edition 2024, jeden Cargo projekt (binárka `todo`), později rozdělení na workspace
  (`todo-core` knihovna + CLI/TUI/GUI binárky) – samotné rozdělení je lekce.
- TUI: `ratatui` + `crossterm`.
- GUI: `egui` / `eframe` (immediate mode, nejjednodušší start). `iced` jen jako volitelné srovnání.
- Ukládání: `serde` + `serde_json`. CLI argumenty: `clap`.

## Osnova (stav: ✅ hotovo, ⬜ čeká)

✅ = lekce je v učebnici (`journal/`), ⬜ = ještě čeká na sepsání. Další lekce autora učebnice je první s ⬜.
Nový student má svůj postup v `journal/student/stav.md`.

### Část I – Základy (konzole)
- ✅ 00 Příprava prostředí (rustup, cargo, git, editor)
- ✅ 01 První program (println!, proměnné, mut, pole vs Vec, for, closure `|x|`)
- ✅ 02 Debugování ve VS Code (CodeLLDB, breakpointy, krokování, `dbg!`, format on save)
- ✅ 03 Struktury a metody (`struct Task`, `impl`, `String` vs `&str`)
- ✅ 04 Enumy a `match` (stav úkolu, `Option`)
- ✅ 05 Vlastnictví a výpůjčky (ownership, borrowing, `&` / `&mut`)
- ✅ 06 Vstup od uživatele (stdin, interaktivní smyčka, parsování příkazů)
- ✅ 07 Chyby (`Result`, `?`, vlastní chybový typ)
- ✅ 08 Moduly (rozdělení do souborů, `pub`, `mod`, `use`)
- ✅ 09 Testy (`cargo test`, unit testy)
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
