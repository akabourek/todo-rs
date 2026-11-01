# todo-rs

Výukový projekt, který má za cíl naučit jazyk Rust od úplných začátků přes TUI až po GUI aplikace.
Učí se na jednoduchém ToDo listu, který po lekcích postupně roste z konzolového programu přes CLI s ukládáním
a terminálové rozhraní (TUI) až po GUI aplikaci.

Kód slouží hlavně k učení, proto má srozumitelnost přednost před chytrostí a nejde o hotový produkt.

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
Stav kódu po každé lekci je v gitu pod tagem `lekce-NN`:

```bash
git checkout lekce-07      # stav kódu po lekci 07
git checkout main          # zpět na aktuální stav
```

## Spuštění

Potřebuješ [Rust](https://www.rust-lang.org/tools/install) 1.95 nebo novější.

```bash
cargo run
```

Program pak čeká na příkazy. Jejich seznam vypíše `help`, ukončí ho `quit`.
