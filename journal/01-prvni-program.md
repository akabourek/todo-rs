# 01 – První program

## Cíl
Vypsat natvrdo zadaný seznam úkolů: proměnné, `Vec`, cyklus `for`, výpis pomocí `println!`.

## Nové pojmy a syntaxe

### Funkce `main`
```rust
fn main() {
    // tělo funkce
}
```
- `fn` = definice funkce, `main` = vstupní bod programu (spustí se jako první).
- `{ }` = blok kódu. Příkazy končí středníkem `;`.

### Proměnné: `let` a `mut`
```rust
let a = 5;       // neměnná – a = 6; by byla chyba kompilace
let mut b = 5;   // mut = měnitelná
b += 1;          // zkratka pro b = b + 1  (Rust nemá ++)
```
Typ se většinou odvodí sám. Explicitně: `let a: i32 = 5;`

### `::` – cesta k funkci typu
```rust
Vec::new()          // funkce new, která patří typu Vec
String::from("x")   // funkce from, která patří typu String
```
`::` čti jako „z“: *new z Vec*. Takovým funkcím se říká asociované (podobné statickým metodám v jiných jazycích).

### `.` – volání metody na hodnotě
```rust
list.push(x);   // přidej na konec (mění list → list musí být mut)
list.len();     // počet prvků
```

### `Vec` – seznam, který umí růst
```rust
let mut list = Vec::new();
list.push(String::from("Apple"));   // typ prvků odvodí kompilátor: Vec<String>

let list = vec![String::from("Apple"), String::from("Banana")];  // totéž přes makro vec!
```

### Pole (array) vs `Vec`
```rust
let list = ["Apple", "Banana", "Cherry"];   // pole: typ [&str; 3] – pevně 3 prvky
let mut v = vec!["Apple", "Banana"];        // Vec<&str> – může růst
v.push("Cherry");                            // u pole push neexistuje
```
| | pole `[T; N]` | `Vec<T>` |
|---|---|---|
| délka | pevná, známá při kompilaci (`N`) | mění se za běhu |
| kde žije | na zásobníku (stack) | data na haldě (heap) |
| kdy použít | pevná sada hodnot | seznam, do kterého přidáváme/mažeme – **náš ToDo list** |

Iterace, `len()`, `iter().enumerate()` fungují u obou stejně.

### `String` vs `"text"` (zatím jen krátce, víc v lekci 03)
- `"Apple"` je **`&str`** – text pevně zapečený v programu, jen pro čtení.
- `String::from("Apple")` je **`String`** – vlastní kopie textu, kterou jde měnit a která patří proměnné.

### `!` – makro
`println!`, `vec!` nejsou funkce, ale **makra** (poznáš je podle `!`). Makro se při kompilaci rozvine na jiný kód –
proto `println!` umí libovolný počet argumentů a kontrolu formátovacího řetězce už při překladu.

```rust
println!("{num}: {entry}");          // {jméno} – vloží proměnnou přímo
println!("Count: {}", list.len());   // {} – vloží další argument v pořadí
```
Do `{…}` jde napsat jen **jméno proměnné**, ne výraz. Proto `list.len()` musí jít jako argument za čárkou.

### `for` a `&`
```rust
for entry in &list {   // & = jen si půjčíme list, prvky si prohlédneme
    println!("{entry}");
}
println!("{}", list.len());   // list pořád existuje
```
Bez `&` (`for entry in list`) by cyklus seznam **spotřeboval** (přesunul) a po cyklu by už nešel použít.
Tomu se říká vlastnictví (ownership), podrobně v lekci 05.

### Iterátory a closure: `|…|`
```rust
list.iter().enumerate().for_each(|(index, entry)| {
    println!("{}: {}", index + 1, entry);
});
```
Čte se zleva doprava, každá metoda vrací něco, na čem jde volat další:
1. `list.iter()` – iterátor: postupně dává odkazy na prvky (`&String`).
2. `.enumerate()` – ke každému prvku přidá pořadí od 0 → dává **dvojice** `(0, "Apple")`, `(1, "Banana")`…
3. `.for_each(…)` – pro každou dvojici zavolá předanou funkci.

**`|…|` je closure = funkce bez jména zapsaná přímo na místě.** Mezi svislítky jsou parametry, za nimi tělo:

```rust
fn plus_one(x: i32) -> i32 { x + 1 }   // normální funkce: parametry v ( )
let plus_one = |x| x + 1;               // closure: parametry v | |
let say_hi = || println!("ahoj");       // closure bez parametrů: ||
```
(Odpovídá `x => x + 1` v JavaScriptu nebo `lambda x: x + 1` v Pythonu.)

**`(index, entry)` uvnitř `|…|` je destrukturování n-tice (tuple).** `enumerate` dává jednu hodnotu typu dvojice
`(usize, &String)`. Vzor `(index, entry)` ji rozbalí do dvou proměnných. Bez rozbalení by to bylo:
```rust
.for_each(|pair| println!("{}: {}", pair.0 + 1, pair.1))   // .0 a .1 = první a druhý prvek n-tice
```

Pozor, `|` má v Rustu i jiné významy podle kontextu: `a | b` je bitové OR, `a || b` logické OR,
a v `match` znamená „nebo“ mezi vzory. Na začátku výrazu (`|x| …`) jde vždy o closure.

Stejné rozbalení funguje i v `for`. V Rustu se pro prosté „projdi a vypiš“ používá spíš `for`:
```rust
for (index, entry) in list.iter().enumerate() {
    println!("{}: {}", index + 1, entry);
}
```

## Postup

**1. verze** – `Vec::new()` + 3× `push(String::from(...))`, cyklus `for entry in &list` s ručním počítadlem
`let mut num = 1;` / `num += 1`, na konci `list.len()`.

`cargo clippy` k tomu dal dvě rady:
- **`vec_init_then_push`** – `new` + hned několik `push` jde napsat jako `let list = vec![...];` (a odpadne `mut`).
- **`explicit_counter_loop`** – ruční počítadlo nahradí `enumerate()`, pak není potřeba `let mut num`.

**Výsledná verze** (tag `lekce-01`):
```rust
fn main() {
    let list = ["Apple", "Banana", "Cherry"];

    println!("====== My ToDo List ======");

    for (index, entry) in list.iter().enumerate() {
        println!("{}: {entry}", index + 1);
    }

    println!("Count: {}", list.len());
}
```
- Seznam se nemění → stačí pole `&str` bez `mut`.
- `enumerate()` čísluje **od 0**. Pro číslování od 1 je potřeba výraz `index + 1`, a ten do `{…}` napsat nejde
  → prázdné `{}` + argument za čárkou. Jména proměnných (`{entry}`) a `{}` jde v jednom řetězci kombinovat.

## Tahák

| Zápis | Význam |
|---|---|
| `let x = 1;` / `let mut x = 1;` | neměnná / měnitelná proměnná |
| `[a, b, c]` / `vec![a, b, c]` | pole (pevná délka) / Vec (roste) |
| `x += 1` | x = x + 1 |
| `Typ::funkce()` | funkce patřící typu (`Vec::new()`) |
| `hodnota.metoda()` | metoda na hodnotě (`list.push(x)`) |
| `nazev!(...)` | makro (`println!`, `vec!`) |
| `{x}` / `{}` ve formátu | vlož proměnnou x / další argument |
| `&list` | půjčka – nepřebírá vlastnictví |
| `\|a, b\| výraz` | closure (anonymní funkce) |
| `(a, b)` ve vzoru | rozbalení dvojice |
| `.iter().enumerate()` | prvky s pořadím `(index, prvek)` |

## Procvičení
1. Odstraň `&` ve `for entry in &list` a přečti si celou chybu kompilátoru. Které slovo v ní je klíčové?
2. Napiš closure `let double = |x| x * 2;` a vypiš `double(21)`.
3. Vypiš úkoly pozpátku (hledej metodu `.rev()` na iterátoru).

## Odkazy
- [Infografika: Štítky a sklenice](infografika/01-prvni-program-infografika.html) – proměnné jako štítky na sklenicích, pole jako plato vs `Vec` jako regál, `for` jako pás, closure jako strojek + hřiště s `push`/`mut` a krokováním `for` (otevřít v prohlížeči)
- [Rust Book 3.1 – Variables and Mutability](https://doc.rust-lang.org/book/ch03-01-variables-and-mutability.html)
- [Rust Book 3.5 – Control Flow (for)](https://doc.rust-lang.org/book/ch03-05-control-flow.html)
- [Rust Book 8.1 – Vectors](https://doc.rust-lang.org/book/ch08-01-vectors.html)
- [Rust Book 13.1 – Closures](https://doc.rust-lang.org/book/ch13-01-closures.html)
- [std::fmt – formátování](https://doc.rust-lang.org/std/fmt/)
