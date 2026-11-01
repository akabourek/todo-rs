---
name: kviz
description: Přidání nebo úprava otázek v opakovacím kvízu todo-rs (journal/kviz/kviz.html, Ferrisova zkouška) – zásady pro otázky, ověření každé ukázky na rustc a složení stránky. Použít vždy při zápisu nové lekce a když student chce kvíz upravit.
---

# Kvíz: Ferrisova zkouška

Jeden kvíz, který roste s lekcemi. Student si v něm vybírá lekce a délku. Stránka `journal/kviz/kviz.html` se **nepíše ručně**,
skládá se ze zdrojů v tomto adresáři:

| Soubor | Co v něm je |
|---|---|
| `questions.js` | otázky a jejich kontroly na `rustc` |
| `template.html` | vzhled a logika stránky, pole `LESSONS` se seznamem lekcí |
| `scripts/verify.js` | ověří všechny otázky na skutečném `rustc` |
| `scripts/build.js` | složí stránku (kontroly do ní nejdou) |
| `scripts/playtest/*.js` | testy pro `playtest.sh` ze skillu `infografika` |

## Přidání lekce

1. **Podklady:** přečti `journal/NN-….md` a kód `git show lekce-NN:src/main.rs`.
2. **`template.html`:** přidej lekci do pole `LESSONS` (název, soubor lekce, soubor infografiky).
3. **`questions.js`:** přidej 5–9 otázek s `l: NN` na konec pole.
4. **Ověř a slož** (dočasné soubory patří do scratchpadu):
   ```bash
   TMPDIR=<scratchpad> node .agents/skills/kviz/scripts/verify.js
   node .agents/skills/kviz/scripts/build.js
   S=.agents/skills/infografika/scripts; P=.agents/skills/kviz/scripts/playtest
   $S/playtest.sh journal/kviz/kviz.html $P/pruchod.js
   $S/playtest.sh journal/kviz/kviz.html $P/vyber-lekci.js
   $S/playtest.sh journal/kviz/kviz.html $P/znacky.js
   $S/overflow.sh journal/kviz/kviz.html
   ```
   Nové otázky prohlédni i na screenshotu (`shot.sh`), hlavně dlouhý kód na mobilu.

## Zásady pro otázky

- **Jen probraná látka.** Nepředbíhat pozdější lekce, formulace „tvoje chyba“ nepoužívat.
- **Každý kód má kontrolu.** Otázka s `code` musí mít `checks`. Pojmové otázky, které jde ověřit kódem, ji mají taky.
  Program z lekce se ověřuje přes `tag: 'lekce-NN'`, ne proti aktuálnímu `src/`, ten se časem změní.
- **Hlášky necitovat zpaměti.** Citované znění (`*…*`) porovnat se skutečným výstupem `rustc`.
- **Čtyři možnosti, právě jedna správná.** Správná nesmí být nápadně nejdelší (`verify.js` vypíše `DLOUHÁ`).
- **„Přeloží se?“ nesmí mít vždy stejnou odpověď.** Střídat s kódem, který se překvapivě přeloží.
- **Každá špatná možnost má `why`** vysvětlující právě ten omyl. `ex` shrne pravidlo a rozebere novou syntaxi.
- **Oslovení bez rodu.** Psát „Do enumu přibyla varianta“, ne „přidal jsi“, kvíz mohou dělat různí studenti.
- **Značky v textu:** `` `kód` ``, `**tučně**`, `*kurzíva*`. Přes kód se tučné ani kurzíva nedají natáhnout.
  Možnost s více řádky nebo výstupem programu patří do pole `code` místo `t`.
