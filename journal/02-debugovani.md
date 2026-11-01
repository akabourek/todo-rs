# 02 – Debugování ve VS Code

[← 01 – První program](01-prvni-program.md) · [Obsah](README.md) · [03 – Struktury a metody →](03-struktury-a-metody.md) · [GitHub](https://github.com/akabourek/todo-rs)

## Cíl
Umět zastavit program na řádku, prohlížet proměnné a krokovat. Mít editor nastavený tak, aby sám formátoval
a ukazoval rady clippy.

## Nové pojmy a syntaxe

| Pojem | Význam |
|---|---|
| **debugger** | program, který spustí náš program a umí ho zastavit a nahlížet do paměti |
| **LLDB** | debugger z projektu LLVM (na něm stojí i kompilátor Rustu); ve VS Code přes rozšíření **CodeLLDB** |
| **breakpoint** | značka na řádku: „tady zastav, než se řádek provede“ |
| **debug build** | `cargo build` bez `--release` – obsahuje ladicí informace (mapování strojového kódu na řádky) |
| `.vscode/launch.json` | jak VS Code spouští ladění (F5) |
| `.vscode/settings.json` | nastavení editoru jen pro tento projekt (Workspace) |

### JSON ve VS Code (JSONC)
```jsonc
{
    "klic": "hodnota",          // dvojice oddělené čárkou
    "cislo": 1,
    "seznam": ["a", "b"],       // [ ] = seznam
    "objekt": { "x": true }     // { } = objekt, za poslední položkou čárka NENÍ
}
```
VS Code navíc dovoluje komentáře `//` a toleruje čárku za poslední položkou – čistý JSON ne.

### Makro `dbg!` – rychlé ladění bez debuggeru
```rust
let x = dbg!(2 + 3);   // vypíše na stderr: [src/main.rs:2:13] 2 + 3 = 5   a vrátí 5
dbg!(&list);           // vypíše celý seznam i s názvem výrazu a číslem řádku
```
- Vypisuje **soubor, řádek, výraz i hodnotu** → víc než `println!`.
- Hodnotu **vrací** dál, takže jde vložit doprostřed výrazu: `let y = dbg!(x * 2) + 1;`
- `dbg!(&list)` s `&` – jen si půjčí; bez `&` by si `list` vzal (přesunul) a dál by nešel použít (lekce 05).
- Do hotového kódu nepatří – je to dočasná pomůcka.

## Postup

Rozšíření ve VS Code: **rust-analyzer** a **CodeLLDB** (`vadimcn.vscode-lldb`, má vlastní LLDB).

### `.vscode/launch.json`
Vytvoření: **Run and Debug** (`Ctrl+Shift+D`) → *create a launch.json file* → **LLDB** → CodeLLDB najde
`Cargo.toml` a konfiguraci vygeneruje. Přidali jsme ručně `terminal` a `sourceLanguages`.

```jsonc
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Debug executable 'todo'",
            "type": "lldb",
            "request": "launch",
            "cwd": "${workspaceFolder}",
            "cargo": {
                "args": ["run", "--bin=todo"]
            },
            "args": [],
            "terminal": "integrated",
            "sourceLanguages": ["rust"]
        }
    ]
}
```

| Klíč | Význam |
|---|---|
| `version` | verze formátu souboru, vždy `"0.2.0"` |
| `configurations` | seznam konfigurací – vybírají se v roletce v panelu Run and Debug |
| `name` | jméno konfigurace v roletce |
| `type: "lldb"` | debugger CodeLLDB |
| `request: "launch"` | program spustit (`"attach"` = připojit se k běžícímu) |
| `cwd` | pracovní adresář programu; `${workspaceFolder}` = kořen projektu (důležité při práci se soubory) |
| `cargo.args` | jak sestavit: `run --bin=todo` – CodeLLDB z toho odvodí sestavení binárky `todo` a spustí ji v debuggeru. (Starší verze CodeLLDB chtěly `"build"` + `"filter"`.) |
| `args` | argumenty pro **náš program** (jako `todo add "x"` – využijeme v lekci s CLI) |
| `terminal: "integrated"` | výstup **i vstup z klávesnice** v terminálu VS Code (`"console"` vstup neumí) |
| `sourceLanguages: ["rust"]` | debugger zobrazí `Vec`, `String`… čitelně, ne jako surovou paměť |

Nápověda klíčů: v souboru `Ctrl+Space` nebo najetí myší na klíč.

### `.vscode/settings.json`
Vytvoření: `Ctrl+,` → záložka **Workspace**, nebo `Ctrl+Shift+P` → *Preferences: Open Workspace Settings (JSON)*.
Workspace nastavení (jen tento projekt) má přednost před User nastavením (všechny projekty).

```jsonc
{
    "rust-analyzer.check.command": "clippy",
    "[rust]": {
        "editor.formatOnSave": true,
        "editor.defaultFormatter": "rust-lang.rust-analyzer"
    }
}
```

| Klíč | Význam |
|---|---|
| `rust-analyzer.check.command` | čím rust-analyzer kontroluje kód po uložení; `clippy` místo výchozího `check` → rady clippy rovnou v editoru |
| `"[rust]": { ... }` | **jazykový blok** – nastavení uvnitř platí jen pro soubory `.rs` |
| `editor.formatOnSave` | při `Ctrl+S` naformátovat (= `cargo fmt`) |
| `editor.defaultFormatter` | kdo formátuje – ID rozšíření rust-analyzer (spouští `rustfmt`) |

**Chyba, na kterou jsme narazili:** `rust-analyzer.check.command` uvnitř bloku `"[rust]"` VS Code nebere.
Do jazykového bloku patří jen nastavení editoru, která jde měnit po jazycích (*language-overridable* – formátování,
odsazení…). Nastavení rozšíření platí pro celý projekt → patří na nejvyšší úroveň.

### Ladění
- klik vlevo od čísla řádku (nebo F9) → červená tečka = breakpoint
- **F5** spustí ladění (nebo nad `fn main` klik na **▶ Debug** od rust-analyzeru)
- program se zastaví **před** řádkem s breakpointem
- panel **Variables**: hodnoty proměnných (`list`, `index`, `entry`…)
- **Watch**: vlastní výraz ke sledování (`index + 1`)
- **Debug Console**: vyhodnocení jednoduchého výrazu za běhu

## Tahák

<img src="ferris/tahak-02.svg" alt="Krab Ferris drží nad hlavou dálkové ovládání" width="110" align="right">

**Ferris radí:** `F9` breakpoint, `F5` spustit, `F10` přes řádek, `F11` dovnitř funkce.

| Klávesa | Akce |
|---|---|
| F9 | přepnout breakpoint na řádku |
| F5 | spustit ladění / pokračovat do dalšího breakpointu |
| F10 | **step over** – provést řádek, do funkcí nevstupovat |
| F11 | **step into** – vstoupit do volané funkce |
| Shift+F11 | **step out** – dokončit funkci a vrátit se o úroveň výš |
| Shift+F5 | ukončit ladění |
| Ctrl+Shift+F5 | restart |

Pravým klikem na breakpoint → **Edit Breakpoint** → podmínka, např. `index == 2` (zastaví jen ve 3. průchodu).

## Procvičení
1. Dej breakpoint na `println!` uvnitř `for` a projdi cyklus přes F5 – sleduj, jak se mění `index` a `entry`.
2. Přidej podmíněný breakpoint `index == 1`.
3. Vlož do cyklu `dbg!(index);`, spusť `cargo run` a porovnej výstup s `println!`. Pak `dbg!` zase smaž.

## Odkazy
- [Infografika: Pauza na dálkovém](infografika/02-debugovani-infografika.html) – debugger jako dálkové ovládání, breakpoint, krokování F10/F11/⇧F11, panely, `dbg!` + hřiště se simulovaným debuggerem nad `main.rs` z lekce 02 (otevřít v prohlížeči)
- [CodeLLDB – User's Manual](https://github.com/vadimcn/codelldb/blob/master/MANUAL.md)
- [VS Code – Debugging](https://code.visualstudio.com/docs/editor/debugging)
- [VS Code – Language specific settings](https://code.visualstudio.com/docs/getstarted/settings#_language-specific-editor-settings)
- [`dbg!` v dokumentaci std](https://doc.rust-lang.org/std/macro.dbg.html)

---

[← 01 – První program](01-prvni-program.md) · [Obsah](README.md) · [03 – Struktury a metody →](03-struktury-a-metody.md) · [GitHub](https://github.com/akabourek/todo-rs)
