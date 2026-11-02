# 08 – Moduly

[← 07 – Chyby](07-chyby.md) · [Obsah](README.md) · [GitHub](https://github.com/akabourek/todo-rs)

## Cíl
Program už není jeden dlouhý `main.rs`, ale čtyři soubory. Umíme zapojit soubor přes `mod`, dojít
k položce cestou `crate::…`, zkrátit si jméno přes `use` a rozhodnout, co je vidět zvenku (`pub`)
a co zůstane schované. Chování programu se nezměnilo.

## Nové pojmy a syntaxe

### Strom modulů
**Modul** je pojmenovaný prostor pro kód. Moduly tvoří strom a jeho kořen je `main.rs` (říká se mu
*crate root*, `crate` = celý přeložený program):
```
crate            ← main.rs, kořen
├── error        ← error.rs
├── list         ← list.rs
└── task         ← task.rs
```
Tři zápisy, tři různé práce:

| Zápis | Co dělá | Kolikrát |
|---|---|---|
| `mod list;` | přidá do stromu novou větev (zapojí soubor) | pro každý soubor jednou v celém programu |
| `crate::task::Task` | cesta stromem od kořene | kdekoli |
| `use crate::task::Task;` | zkrátí cestu na krátké jméno `Task` | v každém souboru, který ho potřebuje |

### `mod` – zapojí soubor do programu
```rust
mod list;   // v main.rs: „mám podmodul list, najdeš ho v src/list.rs“
```
- Soubor bez `mod` kompilátor **vůbec nečte**. I soubor plný nesmyslů projde, dokud na něj nevede `mod`.
- Není to `#include`: nic se nekopíruje. Vznikne prostor se jménem, proto se pak píše `list::…`.
- `mod task;` v `list.rs` by znamenalo podmodul `list`u a Rust by ho hledal v `src/list/task.rs`:
  `E0583 file not found for module`.
- Modul se dá napsat i přímo na místě, se složenými závorkami místo středníku. Bude se hodit u testů
  v lekci 09:
  ```rust
  mod greeting {
      pub fn hello() -> &'static str { "hello" }
  }
  ```

### `::` a `crate::` – cesta stromem
```
crate::task::Task
  │     │     └── typ Task
  │     └──────── v modulu task
  └────────────── začni v kořeni
```
- `::` čti „uvnitř“. Znáš ho z `Task::new` a `TaskError::ZeroIndex`, funguje stejně i pro moduly.
- **Absolutní cesta** začíná `crate::` a funguje odkudkoli.
- **Relativní cesta** se hledá od aktuálního modulu: `task::Task` projde v `main.rs` (`task` je jeho
  podmodul), ale v `list.rs` ne (`list` žádný podmodul `task` nemá).
- `super::` = o úroveň výš. V `list.rs` by `super::task::Task` fungovalo taky, `crate::` je čitelnější.

### `use` – zkratka pro jméno
```rust
use crate::task::Task;   // v tomhle souboru je Task totéž co crate::task::Task
```
- Nic nenačítá. Bez `use` by šlo psát celou cestu, jen zdlouhavě:
  `Vec<crate::task::Task>`.
- **Platí jen pro svůj soubor.** Nic se nedědí, proto má `error.rs` vlastní `use std::fmt;`.
- Nepoužitý `use` je varování `unused import`, smaž ho.
- **Zvyk:** typy se importují přímo (`use task::Task;`, pak `Task::new`), funkce přes jméno modulu
  (`list::print_tasks(…)`). Hned je vidět, odkud funkce pochází. K tomu stačí `mod list;`, další `use`
  není potřeba.

### `pub` – co je vidět zvenku
**Výchozí je soukromí.** Bez `pub` položku vidí jen její modul a jeho potomci. `pub` se píše na každou
položku zvlášť:
```rust
pub struct Task {        // typ je veřejný
    title: String,       // pole zůstává soukromé!
}

impl Task {
    pub fn title(&self) -> &str {   // metoda je veřejná
        &self.title
    }
}
```

| Položka | Bez `pub` | Poznámka |
|---|---|---|
| `struct`, `enum`, `fn` | `E0603 … is private` | |
| metoda, `Task::new` | `E0624 … is private` | každá metoda zvlášť |
| pole struktury | `E0616 field … is private` | `pub struct` pole nezveřejní |
| varianty `enum` | jsou veřejné s enumem | `pub ZeroIndex` je `E0449` |
| `impl fmt::Display for …` | je vidět s typem a traitem | `pub fn fmt` je `E0449`, metody traitu mají viditelnost traitu |

- „Potomci vidí nahoru“: proto `list.rs` může použít modul `task`, i když `mod task;` v `main.rs`
  nemá `pub`. Oba visí na stejném kořeni.
- `pub` neumlčí varování `never used`. Program je binárka, kód zvenku ho volat nemůže, takže kompilátor
  ví, že `find_task` nikdo nepoužívá.

### Soukromá pole a metody místo nich
Ze `task.title` v `main.rs` se stala chyba `E0616`. Dvě cesty:
- `pub title: String`: rychlé, ale kdokoli pak napíše `task.title = String::new()`.
- **Pole nechat soukromá a přidat metody** (naše volba):
  ```rust
  pub fn title(&self) -> &str { &self.title }
  pub fn is_todo(&self) -> bool { matches!(self.status, TaskStatus::ToDo) }
  ```
  Pole se dá číst jen přes `title()` a měnit jen přes `rename`, `start`… Pole i metoda se můžou
  jmenovat stejně, závorky rozliší, co se myslí.

Dva důsledky:
- `TaskStatus` nepotřebuje `pub`: je jen v soukromém poli a žádná veřejná metoda ho nevrací. Čím méně
  je vidět, tím méně kódu se rozbije, když se to změní.
- Se soukromými poli nejde `Task { … }` zapsat mimo `task.rs`: *cannot construct `Task` with struct
  literal syntax due to private fields*. Proto musí být `Task::new` veřejná.

## Postup

1. **Krok 1 – `task.rs`:** `TaskStatus`, `Task` a `impl Task` se přesunuly do nového souboru, v `main.rs`
   přibylo `mod task;` a `use task::Task;`. Kompilátor vedl postupně: `E0603` na typu → `E0624` na
   metodách → `E0616` na polích. Tam přišlo hlavní rozhodnutí: pole zůstala soukromá, přibyly metody
   `title()` a `is_todo()` a v `main.rs` se upravila tři místa. `TaskStatus` bez `pub` stačil.
   Soubor se nejdřív jmenoval `tasks.rs`, ale je v něm jeden typ a `tasks::Task` se čte divně, proto
   přejmenování na `task.rs`. A `self.title.as_str()` → `&self.title`, oboje dělá totéž (`&String` se
   sám převede na `&str`).
2. **Krok 2 – `error.rs`:** přesun `TaskError` s `impl Display`. `use std::fmt;` se přestěhovalo s ním,
   bez něj `E0433 cannot find module or crate fmt`. Na enum stačilo jedno `pub`, varianty ho dostaly
   automaticky. `println!("Error: {}", err)` v `main.rs` funguje dál bez importu `fmt`.
3. **Krok 3 – `list.rs`:** šest funkcí pro práci se seznamem, importy přes `crate::`, volání
   `list::print_tasks(&tasks)`. `pub` dostalo pět funkcí, `parse_index` zůstala soukromá: volá ji jen
   `get_task` ve stejném modulu.
   Chyba po cestě: spolu s `use error::TaskError;` se z `main.rs` smazalo i `mod error;`. Výsledek
   `E0432 unresolved import crate::error`: soubor existuje, ale nevede na něj žádná větev stromu.
   Rada kompilátoru `crate::core::error::TaskError` je slepá ulička, našel jen podobné jméno
   ve standardní knihovně. Smazat se má jen ten `use`.

Výsledek. `main.rs` se zkrátil ze 184 na 56 řádků:

| Soubor | Řádků | Co v něm je | Veřejné |
|---|---|---|---|
| `main.rs` | 56 | `fn main`, smyčka, `match cmd` | |
| `task.rs` | 74 | `TaskStatus`, `Task`, `impl Task` | `Task` a všechny jeho metody |
| `list.rs` | 48 | funkce nad seznamem úkolů | všechno kromě `parse_index` |
| `error.rs` | 20 | `TaskError`, `impl Display` | `TaskError` |

`src/main.rs` (začátek a změněná volání):
```rust
use std::io;
use std::io::Write;

mod error;
mod list;
mod task;
use task::Task;

fn main() {
    let mut tasks: Vec<Task> = vec![
        Task::new("Buy groceries"),
        Task::new("Clean the house"),
        Task::new("Finish Rust project"),
    ];

    loop {
        // … čtení vstupu beze změny …
        match cmd {
            "" => {}
            "quit" => break,
            "list" => list::print_tasks(&tasks),
            "add" => list::add_task(&mut tasks, arg.trim()),
            "startall" => list::start_all(&mut tasks),
            "start" => match list::get_task(&mut tasks, arg) {
                Ok(task) => task.start(),
                Err(err) => println!("Error: {}", err),
            },
            // … done, cancel, help beze změny, jen list::get_task …
        }
    }
}
```
`src/list.rs` (začátek a to, co se změnilo):
```rust
use crate::error::TaskError;
use crate::task::Task;

pub fn print_tasks(tasks: &[Task]) {
    let count_done = tasks.iter().filter(|task| task.is_done()).count();
    tasks.iter().enumerate().for_each(|(index, task)| {
        println!("{}: [{}] {}", index + 1, task.symbol(), task.title());
        println!("   Priority: {}", task.priority_label());
    });
    println!("Done: {}/{}", count_done, tasks.len());
}

// … pub fn add_task, start_all (filter přes task.is_todo()), find_task (task.title() == title) …

fn parse_index(arg: &str) -> Result<usize, TaskError> {
    // … beze změny, a bez pub …
}

pub fn get_task<'a>(tasks: &'a mut [Task], arg: &str) -> Result<&'a mut Task, TaskError> {
    let n = parse_index(arg)?;
    tasks.get_mut(n - 1).ok_or(TaskError::NoSuchTask(n))
}
```
`src/task.rs` (přibyly dvě metody, ostatní jen `pub`):
```rust
#[derive(Debug, Clone)]
enum TaskStatus {            // bez pub
    ToDo,
    InProgress,
    Done,
    Canceled,
}

#[derive(Debug, Clone)]
pub struct Task {
    title: String,           // pole bez pub
    status: TaskStatus,
    priority: Option<u8>,
}

impl Task {
    pub fn new(title: &str) -> Self {
        // …
    }

    pub fn title(&self) -> &str {
        &self.title
    }

    pub fn is_todo(&self) -> bool {
        matches!(self.status, TaskStatus::ToDo)
    }

    // … ostatní metody beze změny, jen s pub …
}
```
`src/error.rs`: stejný kód jako v lekci 07, na začátku `use std::fmt;` a před enumem `pub`.

Poznámky:
- Modul i proměnná se můžou jmenovat stejně: `mod task;` a `Ok(task) => task.start()` si nepřekážejí.
  Text `"list"` v `match` s modulem `list` taky nijak nesouvisí.
- Program se chová přesně jako po lekci 07. Celá lekce je čistý přesun, tomu se říká *refaktoring*.
- Varování `rename`, `set_priority`, `find_task` *never used* trvají, jen ukazují do nových souborů.
- Řádky `mod` a `use` může v `main.rs` srovnat `cargo fmt`, ale jen v rámci souvislého bloku. Prázdný
  řádek bloky odděluje.
- `pub mod` (modul viditelný i mimo program) teď nepotřebujeme. Přijde v lekci 15, až z kódu bude
  knihovna `todo-core`.

## Tahák

<img src="ferris/tahak-08.svg" alt="Krab Ferris drží nad hlavou okénko přepážky" width="110" align="right">

**Ferris radí:** Nový soubor? `mod` v `main.rs`. Jiný modul? `use crate::…`. Vidět zvenku? `pub`, ale jen co je potřeba.

| Zápis | Význam |
|---|---|
| `mod list;` | zapoj `src/list.rs` do programu (píše se v `main.rs`, jednou) |
| `mod x { … }` | modul přímo na místě, bez dalšího souboru |
| `crate::task::Task` | absolutní cesta od kořene (`main.rs`) |
| `task::Task` | relativní cesta od aktuálního modulu |
| `super::task::Task` | cesta o úroveň výš |
| `use crate::task::Task;` | zkratka `Task`, platí jen pro tento soubor |
| `use std::fmt;` pak `fmt::Result` | import modulu, jméno se píše s ním |
| `list::print_tasks(…)` | volání funkce přes jméno modulu (stačí `mod list;`) |
| `pub struct`, `pub enum`, `pub fn` | položka je vidět mimo svůj modul |
| `pub title: String` | veřejné pole (`pub struct` samo pole nezveřejní) |
| enum | varianty jsou veřejné s ním, `pub` se k nim nepíše |
| `impl Display for T` | bez `pub`, ani `fn fmt` ho nemá |
| soukromé | vidí modul a jeho potomci |

**Časté chyby**

| Hláška | Příčina | Lék |
|---|---|---|
| `E0432 unresolved import crate::error` | v `main.rs` chybí `mod error;` | přidat `mod` (nevěřit radě `crate::core::…`) |
| `E0432 unresolved import task` | relativní cesta v `list.rs` | `use crate::task::Task;` |
| `E0433 cannot find module or crate fmt` | chybí `use` v tomto souboru | `use std::fmt;` |
| `E0425 cannot find type Task` | chybí `use` v tomto souboru | `use crate::task::Task;` |
| `E0583 file not found for module` | `mod` ve špatném souboru, nebo soubor neexistuje | `mod` patří do `main.rs`, jinde `use` |
| `E0603 … is private` | položce chybí `pub` | přidat `pub` (nebo ji nechat uvnitř) |
| `E0624 method … is private` | metodě chybí `pub` | přidat `pub` |
| `E0616 field … is private` | sahá se na soukromé pole | metoda, např. `title()` |
| `cannot construct … due to private fields` | `Task { … }` mimo modul | `Task::new(…)` |
| `E0449 visibility qualifiers are not permitted` | `pub` u varianty nebo metody traitu | smazat `pub` |
| `unused import` | `use`, který už není potřeba | smazat `use`, `mod` nechat |

## Procvičení
1. Spoj dva řádky `use std::io;` a `use std::io::Write;` do jednoho: `use std::io::{self, Write};`.
   `{ }` = víc položek ze stejné cesty, `self` = modul `io` samotný.
2. Přesuň nápovědu z větve `"help"` do nového souboru `src/help.rs` jako funkci `print_help`
   a v `match` nech jen `"help" => help::print_help(),`. Co všechno musíš přidat a kam?
3. Přesuň `parse_index` z `list.rs` do nového `src/parse.rs`. Proč teď potřebuje `pub`, když dřív
   nepotřebovala? Který soubor potřebuje `use crate::parse::parse_index;` a který `mod parse;`?

## Odkazy
- [Infografika: Úřad s přepážkami](infografika/08-moduly-infografika.html) – moduly jako kanceláře, `pub` jako přepážka, soukromá pole jako šanony, `use` jako rychlá volba + hřiště s cestou příkazu, „kdo na co dosáhne“ a „rozbij kód“ (otevřít v prohlížeči)
- [Rust Book 7.2 – Control Scope and Privacy with Modules](https://doc.rust-lang.org/book/ch07-02-defining-modules-to-control-scope-and-privacy.html)
- [Rust Book 7.3 – Paths for Referring to an Item](https://doc.rust-lang.org/book/ch07-03-paths-for-referring-to-an-item-in-the-module-tree.html) (`crate::`, `super::`, `pub`)
- [Rust Book 7.4 – Bringing Paths into Scope with use](https://doc.rust-lang.org/book/ch07-04-bringing-paths-into-scope-with-the-use-keyword.html)
- [Rust Book 7.5 – Separating Modules into Different Files](https://doc.rust-lang.org/book/ch07-05-separating-modules-into-different-files.html)
- [Rust By Example – Modules](https://doc.rust-lang.org/rust-by-example/mod.html)

---

[← 07 – Chyby](07-chyby.md) · [Obsah](README.md) · [GitHub](https://github.com/akabourek/todo-rs)
