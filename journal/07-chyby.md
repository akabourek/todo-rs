# 07 – Chyby

[← 06 – Vstup od uživatele](06-vstup-od-uzivatele.md) · [Obsah](README.md) · [GitHub](https://github.com/akabourek/todo-rs)

## Cíl
Program uživateli řekne, **co** udělal špatně: chybí číslo, není to číslo, nula, úkol neexistuje.
Umíme vracet `Result`, přeposlat chybu o patro výš otazníkem `?` a nadefinovat vlastní chybový
typ `enum TaskError`, který se umí vypsat přes `{}`.

## Nové pojmy a syntaxe

### `Result<T, E>` – úspěch, nebo chyba s důvodem
```rust
enum Option<T>    { Some(T), None }     // „něco je / nic není“
enum Result<T, E> { Ok(T),   Err(E) }   // „povedlo se / nepovedlo se, protože…“
```
- `Option` neřekne, **proč** nic není. `Result` má místo `None` variantu `Err`, která nese
  informaci o chybě.
- `<T, E>` = dva **typové parametry** (generika, lekce 12). `T` = typ hodnoty při úspěchu,
  `E` = typ chyby. `Result<usize, String>` čti „buď `usize`, nebo chyba typu `String`“.
- `Ok(…)` a `Err(…)` se píšou bez `Result::` – jsou automaticky v dosahu jako `Some`/`None`.
- `Result` už jsme **dostávali** (`parse`, `read_line`), teď ho sami **vracíme**:
  ```rust
  fn check_age(age: i32) -> Result<i32, String> {
      if age < 0 {
          return Err(format!("Age can't be negative: {}", age));
      }
      Ok(age)
  }
  ```

### `expect` vs `Result`

| Situace | Řešení |
|---|---|
| chyba, která by neměla nastat (nejde psát na terminál) | `.expect("…")` – program spadne se zprávou |
| chyba uživatele (`start abc`) | vrátit `Err(…)`, vypsat hlášku, pokračovat |

### `format!` – text do proměnné
```rust
let msg: String = format!("No task {}", 99);   // nic nevypíše, vrátí String
```
Stejné `{}` jako `println!`, jen výsledek **vrátí** jako `String`. Pro pevný text bez `{}`
stačí `String::from("…")`.

### `return` uprostřed funkce
```rust
if n == 0 {
    return Err(String::from("Task numbers start at 1"));   // odejdi hned
}
Ok(n)                                                     // poslední výraz = návratová hodnota
```
Výraz **bez středníku** je návratová hodnota jen tehdy, když je **poslední** ve funkci.
Uprostřed funkce je potřeba `return`. `Err(…);` bez `return` chybu jen vyrobí a zahodí –
kompilátor pak hlásí matoucí `E0282 type annotations needed` (neví, jaký `T` má ten osamělý `Err`).

### Operátor `?` – „když chyba, vrať ji“
```rust
let n = parse_index(arg)?;
```
Píše se **za** výraz typu `Result` a znamená přesně tohle:
```rust
let n = match parse_index(arg) {
    Ok(n) => n,               // úspěch → vybal hodnotu, jeď dál
    Err(e) => return Err(e),  // chyba → okamžitě skonči funkci a vrať chybu
};
```
- `?` **není** `.expect()`: nepadá, jen chybu předá volajícímu.
- Jde jen ve funkci, která **sama vrací `Result`** (jinak není kam chybu vrátit). V `main`:
  `E0277 the ? operator can only be used in a function that returns Result or Option`.
- **Typ chyby musí sedět.** `?` na `Result<_, TaskError>` ve funkci s `Result<_, String>`:
  `` E0277 `?` couldn't convert the error to `String` ``.
- Na `Option` ve funkci vracející `Result` nejde: `the ? operator can only be used on Results,
  not Options, in a function that returns Result` → nejdřív převést (`ok_or`).
- Pořadí znaků na konci řádku: `…?;` – nejdřív `?` (patří k výrazu), pak `;` (konec příkazu).

### `ok_or`, `ok_or_else` – z `Option` na `Result`
```rust
tasks.get_mut(n - 1).ok_or(TaskError::NoSuchTask(n))           // hodnota chyby rovnou
tasks.get_mut(n - 1).ok_or_else(|| format!("No task {}", n))   // closure, spustí se jen při None
```
- `Some(v)` → `Ok(v)`, `None` → `Err(…)`.
- `|| …` = **closure bez parametrů** (`|task| …` znáš, tady je mezi svislítky prázdno).
- `ok_or_else` se hodí, když je výroba chyby drahá (`format!` skládá text). Varianta enumu je
  levná, tam stačí `ok_or`.
- Nezaměnit: `ok_or(|| …)` → `E0308 expected TaskError, found closure` – `ok_or` chce hodnotu,
  ne „návod, jak ji vyrobit“.

### `map_err` – přemapovat jen chybu
```rust
arg.parse::<usize>()                                    // Result<usize, ParseIntError>
    .map_err(|_| TaskError::NotANumber(arg.to_string()))  // Result<usize, TaskError>
```
Na `Ok` nesáhne, `Err` přepíše na jiný typ chyby – aby pak seděl `?`. `|_|` = closure s jedním
parametrem (původní chybou), který zahazujeme.

### Vlastní chybový typ
```rust
#[derive(Debug)]
enum TaskError {
    MissingArgument,        // bez dat
    NotANumber(String),     // nese text, který uživatel zadal
    ZeroIndex,
    NoSuchTask(usize),      // nese číslo úkolu
}
```
- Proti `String`: program může na druh chyby reagovat `match`em (ne porovnáváním textů),
  kompilátor hlídá překlepy a všechny hlášky jsou na jednom místě.
- `NotANumber(String)` chce **vlastněný** text – chyba si ho odnáší s sebou. Z `&str` udělá
  `String` metoda `.to_string()` (jinak `E0308 expected String, found &str`).

### `impl fmt::Display` – jak chybu vypsat přes `{}`
```rust
use std::fmt;

impl fmt::Display for TaskError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            TaskError::MissingArgument => write!(f, "Missing argument"),
            TaskError::NotANumber(arg) => write!(f, "Not a number: {}", arg),
            // …
        }
    }
}
```
- `{:?}` funguje díky `#[derive(Debug)]` – výpis pro programátora (`NoSuchTask(99)`).
  `{}` potřebuje `Display` – výpis pro uživatele (`No task 99`). Bez něj:
  `` E0277 `TaskError` doesn't implement `std::fmt::Display` ``.
- `impl X for Typ` – čti „implementuj schopnost X pro typ“. Na rozdíl od `impl Task { … }`
  (vlastní metody) tady typ plní **předepsanou** sadu metod = **trait** (lekce 12). Zatím recept.
- `fn fmt(&self, f: &mut fmt::Formatter)` – jméno i signatura jsou dané traitem. `f` = „kam se píše“.
- `-> fmt::Result` je **jiný** `Result` – zkratka pro `Result<(), fmt::Error>` (zápis se povedl/nepovedl).
- `write!(f, "…", …)` = `format!`, jen zapisuje do `f`; vrací `fmt::Result`, proto bez středníku.
- `TaskError::NotANumber(arg) =>` – destrukturování varianty jako `Some(n) =>`.
- Zapomenutá varianta v `match self` → `` E0004 non-exhaustive patterns: `&TaskError::ZeroIndex` not covered ``.

## Postup

1. **Krok 1 – `Result` se `String`em:** `parse_index` vrací `Result<usize, String>` se třemi
   různými výsledky. Nová funkce `get_task` z textu argumentu rovnou vrátí `&mut Task` – vnořené
   `match`, větev `Err(msg) => Err(msg)` chybu jen přeposílá. V `main` místo let chains
   `match get_task(&mut tasks, arg)`. Lifetime `'a` stejně jako u `find_task` (lekce 05) –
   tím se splnila poznámka z lekce 06 o společné funkci pro `start`/`done`/`cancel`.
   Clippy: `&arg` → `arg` (`needless_borrow`, `arg` už je `&str`).
2. **Krok 2 – `?`:** `get_task` se zkrátil na dva řádky (`?` + `ok_or_else`). Bonus: `parse_index`
   přes `map_err(…)?` a `if n == 0 { return Err(…) }`.
   Mezikrok `arg.parse::<usize>().map_err(…)` vracený rovnou propustil nulu jako `Ok(0)` –
   `start 0` by pak v `n - 1` spadl na *subtract with overflow*. Chybějící `;` za `?`.
3. **Krok 3 – `TaskError`:** enum se čtyřmi variantami + `Display`, `String` → `TaskError`
   v obou signaturách, `MissingArgument` pro prázdný `arg`, `ok_or_else` → `ok_or`.
   Chyby po cestě: `Err(…);` bez `return`, `NotANumber(arg)` s `&str`, `get_task` ještě vracel
   `String` (`?` couldn't convert), `ok_or(|| …)`. Editor sám vložil
   `use crate::TaskError::MissingArgument;` (`crate::` = kořen projektu) – nepoužitý, smazán.

Výsledný kód (nové a změněné části):
```rust
use std::fmt;
use std::io;
use std::io::Write;

// … TaskStatus beze změny …

#[derive(Debug)]
enum TaskError {
    MissingArgument,
    NotANumber(String),
    ZeroIndex,
    NoSuchTask(usize),
}

impl fmt::Display for TaskError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            TaskError::MissingArgument => write!(f, "Missing argument"),
            TaskError::NotANumber(arg) => write!(f, "Not a number: {}", arg),
            TaskError::ZeroIndex => write!(f, "Task numbers start at 1"),
            TaskError::NoSuchTask(index) => write!(f, "No task {}", index),
        }
    }
}

// … Task a jeho metody, print_tasks, add_task, start_all, find_task beze změny …

fn parse_index(arg: &str) -> Result<usize, TaskError> {
    if arg.is_empty() {
        return Err(TaskError::MissingArgument);
    }
    let n = arg
        .parse::<usize>()
        .map_err(|_| TaskError::NotANumber(arg.to_string()))?;
    if n == 0 {
        return Err(TaskError::ZeroIndex);
    }
    Ok(n)
}

fn get_task<'a>(tasks: &'a mut [Task], arg: &str) -> Result<&'a mut Task, TaskError> {
    let n = parse_index(arg)?;
    tasks.get_mut(n - 1).ok_or(TaskError::NoSuchTask(n))
}

fn main() {
    // … vytvoření tasks, loop, read_line, split_once beze změny …
        match cmd {
            // …
            "start" => match get_task(&mut tasks, arg) {
                Ok(task) => task.start(),
                Err(err) => println!("Error: {}", err),
            },
            "done" => match get_task(&mut tasks, arg) {
                Ok(task) => task.complete(),
                Err(err) => println!("Error: {}", err),
            },
            "cancel" => match get_task(&mut tasks, arg) {
                Ok(task) => task.cancel(),
                Err(err) => println!("Error: {}", err),
            },
            // …
        }
}
```
Ukázka běhu:
```
> start
Error: Missing argument
> start abc
Error: Not a number: abc
> start 0
Error: Task numbers start at 1
> start 99
Error: No task 99
> start 1
> done 3
> cancel x
Error: Not a number: x
> list
1: [~] Buy groceries
   Priority: None
2: [ ] Clean the house
   Priority: None
3: [X] Finish Rust project
   Priority: None
Done: 1/3
> quit
```
Poznámky:
- Cesta chyby: `parse` → `map_err` → `?` v `parse_index` → `?` v `get_task` → `match` v `main`
  → `Display` → `Error: …`. Každé patro buď chybu vyrobí, nebo ji pošle dál.
- Lepší hlášky prozradily starou drobnost z lekce 06: `done  2` (dvě mezery) teď vypíše
  `Error: Not a number:  2` – v `arg` zůstala mezera na začátku. Stačilo by `arg.trim()`.
- `add_task` pořád hlásí chybu po svém (`println!` uvnitř) – úkol na procvičení.
- `start`/`done`/`cancel` mají stále tři skoro stejné `match` bloky, liší se jen metodou.
- Varování `rename`, `set_priority`, `find_task` *never used* trvají.

## Tahák

| Zápis | Význam |
|---|---|
| `Result<T, E>` | `Ok(T)` = úspěch, `Err(E)` = chyba s důvodem |
| `-> Result<usize, String>` | funkce vrací číslo, nebo text chyby |
| `return Err(…);` | odejdi z funkce s chybou (uprostřed funkce `return` povinné) |
| `Ok(n)` na konci | zabal úspěch (`n` samotné → `E0308 found usize`) |
| `format!("… {}", x)` | jako `println!`, ale vrátí `String` |
| `výraz?` | `Ok(v)` → `v`, `Err(e)` → `return Err(e)` |
| `…?;` | nejdřív `?`, pak `;` |
| `opt.ok_or(chyba)` | `Option` → `Result`, chyba hotová hodnota |
| <code>opt.ok_or_else(&#124;&#124; chyba)</code> | totéž, chyba se vyrobí jen při `None` |
| <code>res.map_err(&#124;_&#124; jiná)</code> | přemapuj jen `Err` (aby seděl typ pro `?`) |
| <code>&#124;&#124; x</code> / <code>&#124;_&#124; x</code> | closure bez parametrů / s jedním zahozeným |
| `enum TaskError { A, B(String) }` | vlastní druhy chyb, varianty s daty |
| `impl fmt::Display for T { fn fmt(…) }` | naučí typ vypsat se přes `{}` |
| `write!(f, "…", …)` | zápis do formatteru, vrací `fmt::Result` |
| `{}` vs `{:?}` | `Display` (pro uživatele) vs `Debug` (pro programátora) |
| `s.to_string()` | `&str` → vlastněný `String` |

**Časté chyby**

| Hláška | Příčina |
|---|---|
| `E0282 type annotations needed` u `Err(…);` | chybí `return` |
| `E0277 ? couldn't convert the error to String` | typ chyby funkce nesedí s typem u `?` |
| `E0277 ? operator can only be used in a function that returns Result` | `?` v `main` / funkci bez `Result` |
| `E0277 ? … on Results, not Options` | `?` na `Option` – nejdřív `ok_or` |
| `E0308 expected TaskError, found closure` | <code>ok_or(&#124;&#124; …)</code> místo `ok_or_else` |
| `E0308 expected String, found &str` | chybí `.to_string()` |
| `E0004 non-exhaustive patterns` | v `Display` chybí varianta |
| `E0277 doesn't implement std::fmt::Display` | `{}` bez `impl Display` |

## Procvičení
1. Přidej variantu `EmptyTitle` a přepiš `add_task` na `-> Result<(), TaskError>`. V úspěchu vrať
   `Ok(())` – `()` je „prázdná hodnota“, nic k vrácení. V `main` vypiš chybu stejně jako u `start`.
2. Přidej příkaz `rename <n> <název>` přes funkci `rename_task(tasks, arg) -> Result<(), TaskError>`.
   Nápověda: `arg.split_once(' ').ok_or(TaskError::MissingArgument)?`, pak `get_task(…)?` a `rename`.
3. Sjednoť obsluhu příkazů: funkce `run_command(tasks: &mut Vec<Task>, cmd: &str, arg: &str)
   -> Result<(), TaskError>`, uvnitř `get_task(tasks, arg)?.start()` atd., a nová varianta
   `UnknownCommand(String)`. V `main` pak jediné `if let Err(err) = run_command(…)`.
   (`quit` nech v `main` – `break` z funkce nejde.)

## Odkazy
- [Infografika: Červená obálka](infografika/07-chyby-infografika.html) – funkce jako patra budovy, `Result` jako zelená/červená obálka, `?` jako potrubní pošta, `TaskError` jako formulář a `Display` jako hlasatel + hřiště, kde pošleš příkaz patry a rozbiješ kód na skutečné hlášky kompilátoru (otevřít v prohlížeči)
- [Rust Book 9.2 – Recoverable Errors with Result](https://doc.rust-lang.org/book/ch09-02-recoverable-errors-with-result.html) (`Result`, `?`)
- [Rust Book 9.3 – To panic! or Not to panic!](https://doc.rust-lang.org/book/ch09-03-to-panic-or-not-to-panic.html)
- [Rust By Example – Defining an error type](https://doc.rust-lang.org/rust-by-example/error/multiple_error_types/define_error_type.html)
- [std::result::Result](https://doc.rust-lang.org/std/result/enum.Result.html) ([`map_err`](https://doc.rust-lang.org/std/result/enum.Result.html#method.map_err)),
  [Option::ok_or](https://doc.rust-lang.org/std/option/enum.Option.html#method.ok_or), [ok_or_else](https://doc.rust-lang.org/std/option/enum.Option.html#method.ok_or_else)
- [std::fmt::Display](https://doc.rust-lang.org/std/fmt/trait.Display.html), [write!](https://doc.rust-lang.org/std/macro.write.html)

---

[← 06 – Vstup od uživatele](06-vstup-od-uzivatele.md) · [Obsah](README.md) · [GitHub](https://github.com/akabourek/todo-rs)
