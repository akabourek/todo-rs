# 03 – Struktury a metody

[← 02 – Debugování ve VS Code](02-debugovani.md) · [Obsah](README.md) · [04 – Enumy a `match` →](04-enumy-a-match.md) · [GitHub](https://github.com/akabourek/todo-rs)

## Cíl
Úkol už není jen text, ale vlastní typ `Task` s názvem a stavem hotovo/nehotovo. Umíme k typu napsat
konstruktor a metody, a víme, kdy použít `String` a kdy `&str`.

## Nové pojmy a syntaxe

### `struct` – vlastní datový typ
```rust
struct Point {
    x: i32,      // pole: jméno: Typ, oddělená čárkou
    y: i32,
}

let p = Point { x: 1, y: 2 };   // vytvoření – pole jménem, na pořadí nezáleží
p.x                             // tečka = přístup k poli
let mut q = Point { x: 0, y: 0 };
q.x = 5;                        // změna pole jen s mut (mut platí pro celou strukturu)
```
Pojmenování: typy `CamelCase` (`Task`), pole a proměnné `snake_case` (`count_done`).

### Atribut `#[derive(Debug)]`
```rust
#[derive(Debug)]
struct Point { x: i32, y: i32 }

println!("{:?}", p);    // Point { x: 1, y: 2 }
println!("{:#?}", p);   // totéž na víc řádků
dbg!(&p);               // dbg! také potřebuje Debug
```
- `#[...]` = **atribut**, pokyn pro kompilátor nad položkou.
- `derive(Debug)` = kompilátor sám vygeneruje ladicí výpis. Bez něj `{:?}` ani `dbg!` nefungují.
- `{:?}` = ladicí výpis, `{}` = výpis pro uživatele (pro vlastní typy se píše ručně – lekce 12, traity).

### `impl` – funkce patřící k typu
```rust
impl Point {
    fn new(x: i32, y: i32) -> Self {   // asociovaná funkce (bez self) → Point::new(1, 2)
        Self { x, y }                    // zkratka za Self { x: x, y: y }
    }
    fn is_origin(&self) -> bool {        // metoda, jen čte → p.is_origin()
        self.x == 0 && self.y == 0
    }
    fn move_right(&mut self) {           // metoda, mění → p.move_right(), p musí být mut
        self.x += 1;
    }
}
```

| Zápis | Význam |
|---|---|
| `-> Typ` | návratový typ funkce |
| `Self` | „typ, ve kterém jsem“ (uvnitř `impl Point` = `Point`) |
| `&self` | metoda si hodnotu půjčí ke čtení |
| `&mut self` | metoda si hodnotu půjčí ke změně |
| bez `self` | asociovaná funkce, volá se `Typ::funkce()` (jako `Vec::new()`) |

### Poslední výraz bez `;` = návratová hodnota
```rust
fn double(x: i32) -> i32 {
    x * 2          // bez středníku → vrátí se
}
```
Se středníkem (`x * 2;`) je to příkaz, funkce nic nevrátí → chyba `mismatched types`.
`return` se píše jen pro předčasný návrat uprostřed funkce.

### `String` vs `&str`

| | `String` | `&str` |
|---|---|---|
| co to je | **vlastní** text (na haldě) | **pohled** do textu, který vlastní někdo jiný |
| měnit | ano | ne |
| vznik | `String::from("a")`, `"a".to_string()` | literál `"a"`, `&muj_string` |

Pravidlo pro začátek:
- **pole struktury → `String`** (struktura vlastní svá data; `&str` v poli by vyžadovalo lifetimes – lekce 14)
- **parametr funkce → `&str`** (přijme literál i `&String`)

### `if` je výraz
```rust
let mark = if done { "X" } else { " " };   // obě větve stejný typ
```
Podmínka bez závorek, musí být `bool` (`if 1 {}` je chyba).

### `Vec<Task>`, indexování
```rust
let mut tasks: Vec<Task> = vec![...];   // <Task> = generický parametr: „Vec čeho“
tasks[1].complete();                    // index od 0; mimo rozsah → panic (bezpečné ukončení)
```

### Auto-deref: proč `task.done` funguje i na `&&Task`
```rust
tasks.iter().filter(|task| task.done).count()
```
- `iter()` dává `&Task`, `filter` předá closure **odkaz na prvek** → `task: &&Task`.
- Tečka (`task.done`) automaticky projde všemi `&` až ke struktuře.
- Ruční dereference je `*` (`*x == 5`) – víc v lekci 05.

## Postup

Výsledný kód (tag `lekce-03`):
```rust
#[derive(Debug)]
struct Task {
    title: String,
    done: bool,
}

impl Task {
    fn new(title: &str) -> Self {
        Self {
            title: title.to_string(),
            done: false,
        }
    }

    fn complete(&mut self) {
        self.done = true;
    }
}

fn main() {
    let mut tasks: Vec<Task> = vec![
        Task::new("Buy groceries"),
        Task::new("Clean the house"),
        Task::new("Finish Rust project"),
    ];

    tasks[1].complete();

    let count_done = tasks.iter().filter(|task| task.done).count();

    tasks.iter().enumerate().for_each(|(index, task)| {
        println!(
            "{}: [{}] {}",
            index + 1,
            if task.done { "X" } else { " " },
            task.title
        );
    });

    println!("Done: {}/{}", count_done, tasks.len());
}
```
- `new` bere `&str` a ukládá `String` (`title.to_string()`).
- `tasks` je `mut`, protože `tasks[1].complete()` mění prvek přes `&mut self`.
- Počet hotových: `filter` nechá jen prvky, pro které closure vrátí `true`, `count()` je spočítá – bez `mut` počítadla.
- `if` přímo jako argument `println!`.
- Styl: pro vedlejší efekty (výpis) je v Rustu obvyklejší `for (index, task) in tasks.iter().enumerate()`;
  `for_each` se používá spíš na konci delších řetězců.

## Tahák

<img src="ferris/tahak-03.svg" alt="Krab Ferris drží nad hlavou kartu úkolu" width="110" align="right">

**Ferris radí:** Metoda jen čte? `&self`. Mění? `&mut self`. A poslední výraz bez `;` je návratová hodnota.

| Zápis | Význam |
|---|---|
| `struct T { a: i32 }` | definice struktury |
| `T { a: 1 }` / `t.a` | vytvoření / přístup k poli |
| `#[derive(Debug)]` + `{:?}` | ladicí výpis struktury |
| `impl T { ... }` | funkce a metody typu |
| `fn f(&self)` / `fn f(&mut self)` | metoda čte / mění |
| `fn new() -> Self` + `T::new()` | konstruktor (asociovaná funkce) |
| výraz bez `;` na konci | návratová hodnota |
| `if c { a } else { b }` | výraz s hodnotou |
| `String` / `&str` | vlastní text / půjčený pohled |
| `.to_string()` | `&str` → `String` |
| `v[i]` | prvek na indexu (od 0) |
| <code>.filter(&#124;x&#124; podmínka).count()</code> | počet prvků splňujících podmínku |

## Procvičení
1. Přidej metodu `fn is_done(&self) -> bool` a použij ji místo přímého `task.done`.
2. Přidej metodu `fn rename(&mut self, new_title: &str)`. Co se stane, když ji zavoláš na `tasks` bez `mut`?
3. Za `x * 2` v nějaké funkci schválně dej `;` a přečti si chybu kompilátoru.

## Odkazy
- [Infografika: Kartotéka úkolů](infografika/03-struktury-infografika.html) – `struct` jako šablona karty, `impl` jako razítko a tlačítka (lupa `&self` / tužka `&mut self`), `String` vs `&str` + hřiště s metodami na kartách (otevřít v prohlížeči)
- [Rust Book 5 – Structs](https://doc.rust-lang.org/book/ch05-00-structs.html)
- [Rust Book 5.3 – Method Syntax](https://doc.rust-lang.org/book/ch05-03-method-syntax.html)
- [Rust Book 3.3 – Functions (výrazy vs příkazy)](https://doc.rust-lang.org/book/ch03-03-how-functions-work.html)
- [Rust Book 4.3 – The Slice Type (&str)](https://doc.rust-lang.org/book/ch04-03-slices.html)

---

[← 02 – Debugování ve VS Code](02-debugovani.md) · [Obsah](README.md) · [04 – Enumy a `match` →](04-enumy-a-match.md) · [GitHub](https://github.com/akabourek/todo-rs)
