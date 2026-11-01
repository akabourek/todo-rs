# 00 – Příprava prostředí

[Obsah](README.md) · [01 – První program →](01-prvni-program.md) · [GitHub](https://github.com/akabourek/todo-rs)

## Cíl
Mít nainstalovaný Rust, založený projekt a git. Vědět, co který nástroj dělá.

## Nové pojmy

| Nástroj | Co dělá |
|---|---|
| `rustup` | správce verzí Rustu (instalace, aktualizace: `rustup update`) |
| `rustc` | samotný kompilátor – přímo ho skoro nevoláme |
| `cargo` | build systém + správce balíčků; tohle používáme pořád |
| crate | balíček Rustu (knihovna nebo program); stahují se z [crates.io](https://crates.io) |
| `rust-analyzer` | rozšíření do editoru: napovídání, chyby při psaní, typy proměnných |

**Edition** (`edition = "2024"` v `Cargo.toml`) – verze jazyka. Starší kód s jinou edicí jde dál
přeložit, nové edice jen přidávají/upravují pravidla.

## Postup

Instalace Rustu přes `rustup` (pokud ho ještě nemáš):

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Instalátor se zeptá na volby, stačí výchozí. Potom otevři nový terminál, aby se načetla cesta k `cargo`.
Rust ke spojení programu potřebuje i linker z překladače C. Pokud pak `cargo build` hlásí `linker cc not found`,
nainstaluj `gcc` (Fedora: `sudo dnf install gcc`, Debian/Ubuntu: `sudo apt install build-essential`).

```bash
rustc --version            # ověření instalace (máme 1.95)
cd ~/Projects/todo-rs
cargo init --name todo     # založí projekt v aktuálním adresáři + git repozitář
```

`cargo init` vytvořil:

```
todo-rs/
├── Cargo.toml   # popis projektu: jméno, verze, edice, závislosti
├── .gitignore   # ignoruje /target (výstupy překladu)
└── src/
    └── main.rs  # vstupní bod programu – funkce main()
```

(`cargo new nazev` dělá totéž, ale vytvoří nový adresář.)

Editor: ve VS Code nainstalovat rozšíření **rust-analyzer**.

## Tahák

| Příkaz | Co dělá |
|---|---|
| `cargo build` | přeloží do `target/debug/` |
| `cargo run` | přeloží a spustí |
| `cargo check` | jen zkontroluje chyby (rychlejší než build) |
| `cargo clippy` | „linter“ – radí, jak psát idiomatičtější kód |
| `cargo fmt` | naformátuje kód podle standardu |
| `cargo build --release` | optimalizovaný build do `target/release/` |

## Procvičení
1. Spusť `cargo run` a podívej se, co vzniklo v `target/debug/`.
2. Spusť přímo `./target/debug/todo`.
3. Zkus `cargo fmt` a `cargo clippy` – zatím nic nehlásí, ale zapamatuj si je.

## Odkazy
- [Infografika: Dílna na Rust](infografika/00-priprava-infografika.html) – rustup, rustc, cargo a git jako dílna, co udělá `cargo init`/`check`/`build`/`run` + hřiště s terminálem a stromem souborů (otevřít v prohlížeči)
- [The Rust Book, kap. 1 – Getting Started](https://doc.rust-lang.org/book/ch01-00-getting-started.html)
- [Cargo Book](https://doc.rust-lang.org/cargo/)

---

[Obsah](README.md) · [01 – První program →](01-prvni-program.md) · [GitHub](https://github.com/akabourek/todo-rs)
