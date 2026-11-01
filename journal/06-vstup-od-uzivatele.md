# 06 – Vstup od uživatele

[← 05 – Vlastnictví a výpůjčky](05-vlastnictvi-a-vypujcky.md) · [Obsah](README.md) · [07 – Chyby →](07-chyby.md) · [GitHub](https://github.com/akabourek/todo-rs)

## Cíl
Program už jen nevypisuje pevná data: zobrazí výzvu `> `, přečte příkaz z klávesnice, provede ho
a čeká na další. Umíme číst řádek ze stdin, rozdělit ho na příkaz a parametr a převést text na číslo.

## Nové pojmy a syntaxe

### `use` – zkratka do modulu
```rust
use std::io;          // pak stačí psát io::stdin()
use std::io::Write;   // zpřístupní metodu flush()
```
- `std` = standardní knihovna, `io` = její modul pro vstup/výstup.
- `::` = oddělovač cesty, čti „uvnitř“: `std::io` je modul `io` uvnitř `std`
  (stejně jako `TaskStatus::Done` nebo `Task::new`).
- `use` nic nenačítá, jen zkracuje zápis. Bez `use std::io;` by se psalo `std::io::stdin()`.
- `use std::io::Write;` je potřeba kvůli `flush()`: ta je metodou **traitu** `Write` (trait = sada
  metod, které typ umí; lekce 12). Bez `use` ji kompilátor „nevidí“ a ohlásí `E0599`
  s radou, co importovat.

### Čtení řádku
```rust
let mut buff = String::new();
let bytes = io::stdin().read_line(&mut buff).expect("Can't read");
```
- `String::new()` – prázdný vlastněný řetězec, který může růst.
- `io::stdin()` – „rukojeť“ ke standardnímu vstupu (klávesnice v terminálu).
- `.read_line(&mut buff)` – počká na Enter a text **připíše na konec** `buff`. Proto `&mut`
  (zapisuje do našeho `String`) a proto `let mut buff`.
- Vrací `Result` (povedlo se / chyba). `.expect("…")` při chybě shodí program s danou zprávou,
  jinak vybalí hodnotu – **počet přečtených bajtů** (`usize`). Pořádně `Result` v lekci 07.
- Dvě pasti:
  1. `read_line` nemaže, jen připisuje → `String` vytvářet **uvnitř** smyčky (nebo `buff.clear()`).
  2. V textu zůstane `\n` z Enteru: napíšeš `quit`, v `buff` je `"quit\n"`.

### Konec vstupu (EOF)
```rust
if bytes == 0 {
    break;
}
```
Ctrl+D (Linux/macOS) = „vstup skončil“. `read_line` pak nečeká a hned vrací `0`. Bez této
kontroly se smyčka zacyklí a donekonečna vypisuje `> Unknown command:`.
Prázdný Enter je něco jiného – vrátí `1` (je v něm `\n`).

### `print!` a `flush()`
```rust
print!("> ");
io::stdout().flush().expect("Can't write");
```
- `print!` = `println!` bez odřádkování.
- Terminál posílá výstup po řádcích, takže `> ` bez `\n` by se neukázal. `flush()` ho „spláchne“
  na obrazovku hned.

### `loop`, `break`, `continue`
```rust
loop {
    // opakuje se pořád
    if konec { break; }   // vyskočí ze smyčky
}
```
- `loop` = nekonečná smyčka (idiomatičtější než `while true`).
- `break` ukončí nejbližší smyčku, `continue` skočí na začátek dalšího kola.
- `break` může stát i jako větev `match`: `"quit" => break,`.

### `.trim()` – oříznutí bílých znaků
```rust
let input = buff.trim();   // "  list\n" → "list"
```
Vrací `&str` – **pohled** do `buff` bez mezer a `\n` na okrajích. Nic se nekopíruje (slice, lekce 05).
Ořezávat **před** dělením na příkaz a parametr, jinak `"  list"` dá prázdný příkaz.

### `split_once`, `unwrap_or` a destrukturování n-tice
```rust
let (cmd, arg) = input.split_once(' ').unwrap_or((input, ""));
```
- `split_once(' ')` rozdělí podle **první** mezery:
  `"add Koupit mléko"` → `Some(("add", "Koupit mléko"))`, `"list"` → `None`.
  Vrací `Option<(&str, &str)>` – mezera tam být nemusí.
- `(a, b)` = **n-tice** (tuple): dvojice hodnot v kulatých závorkách.
- `.unwrap_or(x)` – ze `Some(v)` vrátí `v`, z `None` vrátí náhradní `x`. Tady: když mezera není,
  celý vstup je příkaz a parametr je `""`.
- `let (cmd, arg) = …` – vlevo není jedna proměnná, ale **vzor**; dvojice se rozloží do dvou
  proměnných (stejně jako `|(index, task)|` u `enumerate`).
- Zbylé mezery zůstanou na začátku `arg` (`"add   Víc"` → `arg = "  Víc"`), proto `arg.trim()`.

### `match` na řetězec
```rust
match cmd {
    "" => {}
    "quit" => break,
    "list" => print_tasks(&tasks),
    _ => println!("Unknown command: {}, try: help", cmd),
}
```
- Vzory můžou být i textové literály.
- `_` je u řetězců povinné – textů je nekonečně mnoho, `match` musí pokrýt všechny.
- `{}` = **prázdný blok**, „neudělej nic“ (každá větev musí mít výraz).
- Víc příkazů ve větvi = blok `{ …; …; }`.

### `parse` – text na číslo, a turbofish `::<>`
```rust
match arg.parse::<usize>() {
    Ok(0) => None,
    Ok(n) => Some(n),
    Err(_) => None,
}
```
- `parse` převádí text na zvolený typ. `::<usize>` (**turbofish**, „rybka“) říká *na jaký* –
  `parse` umí spoustu typů a sám to neví.
- Vrací `Result`: `Ok(hodnota)` nebo `Err(chyba)`. Matchuje se jako `Some`/`None`.
- `Err(_)` – chyba nás nezajímá, nepojmenováváme ji.
- `Ok(0)` – vzor s konkrétní hodnotou uvnitř (jako `Some(1)` v `priority_label`). Musí stát
  **před** `Ok(n)`, jinak by nulu chytilo `Ok(n)`.
- Pokud chybu zahazujeme celou, existuje zkratka `.ok()` (`Result` → `Option`):
  `arg.parse::<usize>().ok()` – clippy ji navrhuje jako `manual_ok`.

### Past: odčítání u `usize`
`usize` nemá záporná čísla. `0 - 1` v debug režimu shodí program:
`attempt to subtract with overflow`. Proto `parse_index` nulu odmítne (`Ok(0) => None`)
a `n - 1` se počítá až potom.

### `get_mut` – prvek ke změně
```rust
tasks.get_mut(n - 1)   // Option<&mut Task>
```
Bratr `get` z lekce 04: `Some(&mut Task)`, když index existuje, jinak `None`. Číslo zadané
uživatelem nikdy neindexuj přes `tasks[i]` – při `done 99` by program spadl.

### Řetězení podmínek v `if` (let chains)
```rust
if let Some(n) = parse_index(arg)
    && let Some(task) = tasks.get_mut(n - 1)
{
    task.start();
} else {
    println!("Invalid task no!");
}
```
- Novinka **edice 2024**: v jednom `if` jde spojit víc `let` vzorů i obyčejných podmínek přes `&&`.
- Čti: „když `parse_index` vrátí `Some(n)` **a zároveň** `get_mut` vrátí `Some(task)`, tak…“.
- Vyhodnocuje se zleva a **líně** – když první část selže, další se nepočítá. Proměnná z dřívější
  části (`n`) jde použít v pozdější (`n - 1`).
- `else` se provede, když selže **kterákoli** část – proto nejde rozlišit, proč (není číslo /
  nula / neexistuje). Lepší chybové zprávy přinese lekce 07.
- Ve starších návodech to nenajdeš – dřív se psaly vnořené `if let` nebo `match`.

### Interaktivní program a debugger
V ladicí konzoli VS Code (CodeLLDB) se na stdin psát nedá. Pro krokování přidat do konfigurace
v `.vscode/launch.json` `"terminal": "integrated"` – program pak běží v terminálu.

## Postup

1. Nahoru `use std::io;` a `use std::io::Write;`. Ukázkový kód v `main` (volání `cancel`, `rename`,
   `find_task`, `tasks.get(10)`) zmizel, zůstalo jen vytvoření vektoru se třemi úkoly.
2. **Krok 1:** `loop` s výzvou (`print!` + `flush`), `read_line`, `trim` a `match` na příkazy
   `quit`, `list`, `help`. Zkouška Ctrl+D ukázala zacyklení.
3. **Krok 2:** kontrola `bytes == 0` (EOF), rozdělení na `(cmd, arg)` přes `split_once` +
   `unwrap_or`, nové příkazy `add`, `start`, `done`, `cancel` a navíc `startall`
   (vyžil tak `start_all` z lekce 05), prázdná větev `""`.
4. `add_task` odmítá prázdný název (`title.is_empty()`), pomocná funkce `parse_index` převádí
   parametr na číslo a odmítá nulu.
5. Oprava chyby: `unwrap_or((&buff, ""))` vracel **neoříznutý** text, takže příkazy bez parametru
   (`list`, `help`, prázdný Enter) končily jako `Unknown command: list\n`. Prozradilo to `, try: help`
   na novém řádku. Řešení: `let input = buff.trim();` a dál pracovat jen s `input`.
6. Clippy: `len() == 0` → `is_empty()`, `&arg` → `arg` (`arg` už je `&str`, `needless_borrow`).

Výsledný kód (nové a změněné části):
```rust
use std::io;
use std::io::Write;

// … TaskStatus, Task a jeho metody beze změny …

fn add_task(tasks: &mut Vec<Task>, title: &str) {
    if title.is_empty() {
        println!("Title can't be empty!");
        return;
    }
    tasks.push(Task::new(title));
}

fn parse_index(arg: &str) -> Option<usize> {
    match arg.parse::<usize>() {
        Ok(0) => None,
        Ok(n) => Some(n),
        Err(_) => None,
    }
}

fn main() {
    let mut tasks: Vec<Task> = vec![
        Task::new("Buy groceries"),
        Task::new("Clean the house"),
        Task::new("Finish Rust project"),
    ];

    loop {
        print!("> ");
        io::stdout().flush().expect("Can't write");
        let mut buff = String::new();
        let bytes = io::stdin().read_line(&mut buff).expect("Can't read");
        if bytes == 0 {
            break;
        }
        let input = buff.trim();
        let (cmd, arg) = input.split_once(' ').unwrap_or((input, ""));
        match cmd {
            "" => {}
            "quit" => break,
            "list" => print_tasks(&tasks),
            "add" => add_task(&mut tasks, arg.trim()),
            "startall" => start_all(&mut tasks),
            "start" => {
                if let Some(n) = parse_index(arg)
                    && let Some(task) = tasks.get_mut(n - 1)
                {
                    task.start();
                } else {
                    println!("Invalid task no!");
                }
            }
            // "done" a "cancel" stejně, jen task.complete() / task.cancel()
            "help" => {
                println!("quit: end of app");
                println!("list: print all tasks");
                // …
            }
            _ => println!("Unknown command: {}, try: help", cmd),
        }
    }
}
```
Ukázka běhu:
```
> add Test
> done 4
> start 1
> done 0
Invalid task no!
> done 99
Invalid task no!
> add
Title can't be empty!
> foo
Unknown command: foo, try: help
> list
1: [~] Buy groceries
   Priority: None
2: [ ] Clean the house
   Priority: None
3: [ ] Finish Rust project
   Priority: None
4: [X] Test
   Priority: None
Done: 1/4
> quit
```
Poznámky:
- `parse_index` vrací číslo **od 1** (jak ho píše uživatel), `- 1` je až v `main`. Funguje to,
  jen název napovídá index od 0 – kandidát na přejmenování (`parse_task_no`) nebo přesun `- 1`
  dovnitř funkce.
- Bloky `start` / `done` / `cancel` se liší jen voláním metody. Jedna funkce vracející
  `Option<&mut Task>` by je zjednodušila, ale potřebuje lifetimes (lekce 14).
- Varování `rename`, `set_priority`, `find_task` *never used* – zatím pro ně nejsou příkazy.
- `arg` se ořezává jen u `add`; u čísel to nevadí, protože `input` je oříznutý a `split_once`
  dělí na první mezeře – `done  2` (dvě mezery) ale skončí `Invalid task no!`.

## Tahák

| Zápis | Význam |
|---|---|
| `use std::io;` | zkratka: `io::…` místo `std::io::…` |
| `io::stdin().read_line(&mut s)` | přečti řádek, **připiš** do `s` (vč. `\n`), vrať počet bajtů |
| `bytes == 0` | konec vstupu (Ctrl+D) |
| `print!` + `io::stdout().flush()` | výpis bez odřádkování, hned na obrazovku |
| `loop { … break; }` | nekonečná smyčka / vyskočení z ní |
| `s.trim()` | `&str` bez bílých znaků na okrajích |
| `s.split_once(' ')` | `Option<(&str, &str)>` – rozdělení podle první mezery |
| `opt.unwrap_or(x)` | hodnota ze `Some`, jinak `x` |
| `let (a, b) = dvojice;` | destrukturování n-tice |
| `"quit" => break,` | `match` na text, `_` povinné |
| `"" => {}` | prázdný blok – nic nedělej |
| `s.parse::<usize>()` | text → číslo, `Result` (`Ok` / `Err`), `::<>` = turbofish |
| `result.ok()` | `Result` → `Option` (chybu zahodí) |
| `v.get_mut(i)` | `Option<&mut T>` |
| `if let A = x && podm && let B = y { }` | let chains (edice 2024), líné vyhodnocení |
| `0 - 1` u `usize` | panika *subtract with overflow* (v debug) |

## Procvičení
1. Přidej příkaz `find <název>`, který přes `find_task` najde úkol a vypíše jeho stav, nebo
   `Task not found`. (Varování `find_task is never used` zmizí.)
2. Rozliš chybové hlášky: `Not a number: abc`, `Task numbers start at 1` a `No task 99`.
   Nápověda: místo let chains použij `match arg.parse::<usize>()` a uvnitř `tasks.get_mut(…)`.
3. Přidej příkaz `rename <n> <název>`. Nápověda: `arg.split_once(' ')` ještě jednou a výsledek
   destrukturuj do `(no, title)`. Co uděláš, když název chybí?

## Odkazy
- [Infografika: Cesta příkazu](infografika/06-vstup-infografika.html) – stanice od `read_line` po `get_mut`, let chains jako řada branek + hřiště, kde pošleš příkaz svým programem (otevřít v prohlížeči)
- [Rust Book 2 – Programming a Guessing Game](https://doc.rust-lang.org/book/ch02-00-guessing-game-tutorial.html) (stdin, `read_line`, `parse`, `loop`)
- [Rust Book 3.5 – Control Flow (`loop`, `break`)](https://doc.rust-lang.org/book/ch03-05-control-flow.html)
- [Rust Book 3.2 – Data Types (tuples)](https://doc.rust-lang.org/book/ch03-02-data-types.html#the-tuple-type)
- [std::io::Stdin::read_line](https://doc.rust-lang.org/std/io/struct.Stdin.html#method.read_line)
- [str::split_once](https://doc.rust-lang.org/std/primitive.str.html#method.split_once), [str::parse](https://doc.rust-lang.org/std/primitive.str.html#method.parse)
- [Rust Reference – if let chains](https://doc.rust-lang.org/reference/expressions/if-expr.html#chains-of-conditions)

---

[← 05 – Vlastnictví a výpůjčky](05-vlastnictvi-a-vypujcky.md) · [Obsah](README.md) · [07 – Chyby →](07-chyby.md) · [GitHub](https://github.com/akabourek/todo-rs)
