# todo-rs

Výukový projekt, který má za cíl naučit jazyk Rust od úplných začátků přes TUI až po GUI aplikace.
Učí se na jednoduchém ToDo listu, který po lekcích postupně roste z konzolového programu přes CLI s ukládáním
a terminálové rozhraní (TUI) až po GUI aplikaci.

Kód slouží hlavně k učení, proto má srozumitelnost přednost před chytrostí a nejde o hotový produkt.

## Předpoklady

- **Linux:** projekt je navržený primárně pro uživatele Linuxu. Na macOS a Windows nebyl testovaný, příkazy a návody
  v lekcích tam můžou vyžadovat úpravy.
- **Git:** na stažení projektu a práci s lekcemi.
- **AI agent:** nástroj, který umí pracovat se soubory v projektu a číst `AGENTS.md`, např. Claude Code nebo Codex.
- **Rust:** předem ho instalovat nemusíš, instalaci i nastavení editoru řeší lekce 00.
- **Psaní nových lekcí:** skripty pro ověřování infografik navíc potřebují Google Chrome a Python s knihovnou Pillow.
  Při procházení hotových lekcí je nepotřebuješ.

## Jak začít s výukou

Projekt je určený k procházení s AI agentem (např. Claude Code nebo Codex), který podle [AGENTS.md](AGENTS.md)
vysvětluje, zadává úkoly a kontroluje kód. Kód ale píšeš sám.

1. Naklonuj si repozitář a smaž hotový kód, ať můžeš začít od nuly:

   ```bash
   git clone https://github.com/akabourek/todo-rs.git
   cd todo-rs
   rm -rf src Cargo.toml Cargo.lock
   ```

2. V adresáři projektu spusť svého agenta a řekni mu, že jsi nový student a začínáš lekcí 00.
3. Pokračuj lekci po lekci. Hotové zápisy v `journal/` slouží jako učebnice a agent je nepřepisuje, tvůj postup si
   vede v `journal/student/stav.md`.

## Lekce

Ke každé lekci patří zápis a interaktivní infografika. Obsah je v [journal/README.md](journal/README.md).
Stav kódu po každé lekci je v gitu pod tagem `lekce-NN`.

Učebnici čti vždycky z větve `main` (nebo na webu), tagy používej jen na kód. Materiály k lekcím přibývají
a opravují se průběžně, takže `git checkout lekce-07` by ukázal i starou, neúplnou učebnici. Místo něj:

```bash
git diff lekce-06 lekce-07 -- src/           # co v kódu přibylo mezi lekcemi
git show lekce-08:src/list.rs                # jeden soubor, jak vypadal po lekci 08
git worktree add ../todo-lekce-07 lekce-07   # celý projekt po lekci 07 ve vedlejší složce
git worktree remove ../todo-lekce-07         # vedlejší složku zase smazat
```

## Spuštění

Potřebuješ [Rust](https://www.rust-lang.org/tools/install) 1.95 nebo novější.

```bash
cargo run
```

Program pak čeká na příkazy. Jejich seznam vypíše `help`, ukončí ho `quit`.
