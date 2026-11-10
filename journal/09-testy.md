# 09 – Testy

[← 08 – Moduly](08-moduly.md) · [Obsah](README.md) · [GitHub](https://github.com/akabourek/todo-rs)

## Cíl
Program si umí zkontrolovat sám. Místo ručního zkoušení `start 0`, `start abc`… napíšeme **unit testy**:
malé funkce, které zavolají kus kódu a porovnají výsledek s tím, co čekáme. Spustí je jeden příkaz
`cargo test`. Chování programu se nezměnilo, přibylo 16 testů a `PartialEq` u tří typů.

## Nové pojmy a syntaxe

### Test je funkce s atributem `#[test]`
```rust
#[test]
fn parse_index_number() {
    assert_eq!(parse_index("3"), Ok(3));
}
```
- `#[…]` je **atribut**, poznámka pro kompilátor k položce pod ní. Znáš ho z `#[derive(Debug)]`.
  `#[test]` říká: „tuhle funkci spusť při `cargo test`, v normálním programu ji vynech“.
- Test nemá parametry ani návratovou hodnotu. **Projde, když doběhne. Selže, když zpanikaří.**
- Proto v testu nevadí `.unwrap()`: když přijde `Err`, test zpanikaří, a tím selže. Přesně to chceme.
- Jméno testu popisuje, co ověřuje: `parse_index_rejects_zero`. Ve výpisu je pak hned vidět, co se
  pokazilo. Předpona `test_` je zbytečná, to už říká `#[test]`.

### `assert!`, `assert_eq!`, `assert_ne!` – kontroly
Všechno jsou to makra (`!`, jako `println!`). Když kontrola neprojde, zpanikaří.

| Makro | Selže, když… | Při selhání vypíše |
|---|---|---|
| `assert!(x)` | `x` je `false` | jen podmínku: `assertion failed: tasks[0].is_done()` |
| `assert_eq!(a, b)` | `a != b` | obě hodnoty, `left` a `right` |
| `assert_ne!(a, b)` | `a == b` | obě hodnoty |

Výpis selhání `assert_eq!` (skutečný výstup, kdyby `parse_index` nekontrolovala nulu):
```
thread 'list::tests::parse_index_rejects_zero' (213925) panicked at src/list.rs:62:9:
assertion `left == right` failed
  left: Ok(0)
 right: Err(ZeroIndex)
```
- `left` je první argument, `right` druhý. Zvyk: **nejdřív skutečná hodnota, pak očekávaná**,
  `assert_eq!(parse_index("0"), Err(TaskError::ZeroIndex))`.
- Na porovnání proto používej `assert_eq!(a, b)`, ne `assert!(a == b)`. Funguje to stejně, ale
  `assert!` při selhání neukáže, co v `a` doopravdy bylo.
- Číslo v závorce za jménem vlákna se při každém spuštění mění, nevšímej si ho.

### `PartialEq` – co jde porovnat přes `==`
`assert_eq!` uvnitř porovnává `left == right` a vypisuje přes `{:?}`. Obě hodnoty proto potřebují
dvě schopnosti (traity): `PartialEq` (porovnání) a `Debug` (výpis). Čísla a texty je mají, **vlastní
typy ne**:
```
error[E0369]: binary operation `==` cannot be applied to type `Result<usize, error::TaskError>`
note: an implementation of `PartialEq` might be missing for `error::TaskError`
help: consider annotating `error::TaskError` with `#[derive(PartialEq)]`
```
Dva `Result` jdou porovnat jen tehdy, když jde porovnat i to, co je uvnitř. `usize` to umí, `TaskError`
ne. Stejně tak `Option<&Task>` s `None` jde porovnat, jen když to umí `Task`. Dvě cesty:

1. **`#[derive(PartialEq)]`** (naše volba). Funguje jako `#[derive(Debug)]`: kompilátor sám napíše
   porovnání „stejná varianta a stejný obsah“. Víc věcí v jednom `derive` se odděluje čárkou:
   ```rust
   #[derive(Debug, PartialEq)]
   pub enum TaskError { … }
   ```
2. **`assert!(matches!(…))`** nechá typ beze změny. `matches!` z lekce 04 nic neporovnává přes `==`,
   jen zkouší, jestli hodnota pasuje na **vzor**:
   ```rust
   assert!(matches!(parse_index("0"), Err(TaskError::ZeroIndex)));
   assert!(matches!(parse_index("abc"), Err(TaskError::NotANumber(_))));  // text je jedno
   ```
   Hodí se, když typ porovnávat nechceš, nebo když tě obsah nezajímá (`_`). Nevýhoda: při selhání
   vypíše jen `assertion failed`, hodnoty neukáže.

### `#[cfg(test)] mod tests` – testy přímo v souboru
Testy se píšou na konec souboru, který testují:
```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_index_rejects_zero() { … }
}
```
- **`mod tests { … }`** je modul napsaný na místě (lekce 08). Ve stromu je to `crate::list::tests`,
  tedy **dítě** modulu `list`. Proto ve výpisu `cargo test` vidíš jména jako `list::tests::parse_index_rejects_zero`.
- **`#[cfg(test)]`**: `cfg` = *configuration*. Celý modul se přeloží **jen při `cargo test`**.
  V `cargo build` a v hotovém programu testy nejsou. Bez něj by `cargo build` hlásil
  `function sample_tasks is never used`.
- **`use super::*;`**: `super` je rodič (`list`), **`*` znamená „všechno“** (glob import). Čti
  „použij všechno z rodiče“. `use` se nedědí ani do vnořeného modulu, bez tohoto řádku `tests` nezná
  `parse_index` ani `TaskError`.
- **Testy vidí soukromé věci.** Potomek vidí soukromé položky předků (lekce 08). Test proto smí volat
  soukromou `parse_index` a v `task.rs` sahat přímo na `task.status`, i když pole nemá `pub`.

Modul smí obsahovat jen **položky**: `fn`, `use`, `struct`, další `mod`… Příkazy jako `assert_eq!(…)`
nebo `let` patří **do těla funkce**. Napsat je rovnou do `mod tests { }` je stejná chyba, jako napsat
`println!` mimo funkci:
```
error: macro expansion ignores keyword `match` and any tokens following
  = note: the usage of `assert_eq!` is likely invalid in item context
```
(`assert_eq!` se rozbalí na `match`, odtud ta zmínka o `match`.)

### Pomocná funkce a `.unwrap_err()`
- V `mod tests` můžou být i funkce **bez** `#[test]`. Samy se nespustí, volají je testy. Hodí se na
  přípravu dat:
  ```rust
  fn sample_tasks() -> Vec<Task> {
      vec![Task::new("A"), Task::new("B")]
  }
  ```
  Každý test si ji zavolá a dostane **vlastní** čerstvý `Vec`. Testy si nic nesdílejí.
- **`.unwrap_err()`** je opak `.unwrap()`. Z `Err(e)` vrátí `e`, na `Ok` zpanikaří
  (`called Result::unwrap_err() on an Ok value: …`). Hodí se, když chceš porovnat jen chybu, protože
  `Ok` část (`&mut Task`) přes `==` porovnat nejde.

### `cargo test`
```
$ cargo test
running 16 tests
test list::tests::add_empty_task ... ok
test list::tests::find_task_result ... ok
…
test task::tests::task_start ... ok

test result: ok. 16 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```
- Testy běží **paralelně a v libovolném pořadí**. Pořadí ve výpisu se mezi spuštěními mění, každý test
  proto musí fungovat sám za sebe.
- `cargo test parse` spustí jen testy, které mají `parse` v cestě (`… 12 filtered out`). Funguje i
  `cargo test task::` pro všechny testy z `task.rs`.
- Výstup `println!` z testů, které **prošly**, se schová. U testu, který selhal, se ukáže pod
  `---- … stdout ----`. Vidět ho vždycky chceš? `cargo test -- --nocapture` (argumenty za `--` nedostane
  Cargo, ale testovací program).

### Jak vypadá dobrý test
- **Jedna věc na test.** Když selže první `assert_eq!`, zbytek testu se neprovede. Čtyři kontroly
  v jednom testu = při chybě nevíš, kolik dalších je rozbitých.
- **Očekávanou hodnotu napiš natvrdo.** `assert_eq!(…title(), "B")`, ne hodnotu spočítanou ze stejných
  dat, která testuješ. Jinak test projde i tehdy, když se rozbijí obě strany stejně.
- **Ověřuj přesně.** „Titulek není prázdný“ projde i se špatným titulkem. „Titulek je `A`“ ne.
- **Okrajové případy:** `0`, prázdný text, priorita `9`, číslo za koncem seznamu. Tam se chyby schovávají.
- **Obě strany:** `start_all` má spustit úkoly `ToDo` **a** nechat ostatní být. Test jen jedné
  poloviny chybu v té druhé nenajde.

## Postup

1. **Krok 1 – `parse_index` v `list.rs`.** Na konec souboru přibyl `#[cfg(test)] mod tests`. Kompilátor
   vedl postupně:
   - `assert_eq!` stály přímo v těle modulu: `the usage of assert_eq! is likely invalid in item context`.
     Kolem kontrol chyběla funkce s `#[test]`. Varování `unused import: super::*` byl důsledek:
     kompilátor řádky zahodil a import nikdo nepoužil.
   - `E0308 expected String, found &str` u `NotANumber("abc")`: varianta nese `String`, takže
     `"abc".to_string()`.
   - `E0369 binary operation == cannot be applied`: `TaskError` neuměl `==`. Řešení: `PartialEq` do
     `#[derive(…)]` v `error.rs`.
   - Čtyři kontroly v jednom testu `test_parse_index` se rozdělily do čtyř testů s popisnými jmény.
2. **Krok 2 – `Task` v `task.rs`.** Vlastní `mod tests` se sedmi testy. Testy sahají přímo na soukromá
   pole `title` a `status`. Stav se porovnává přes `assert_eq!(task.status, TaskStatus::InProgress)`,
   proto dostal `PartialEq` i `TaskStatus`. Přibyl i okrajový případ: `set_priority(9)` dá `"None"`.
3. **Krok 3 – funkce nad seznamem v `list.rs`.** Pomocná `sample_tasks()` a pět testů. Dvě zastávky:
   - Test se jmenoval `get_task`, stejně jako testovaná funkce. Volání `get_task(…)` uvnitř pak volalo
     **test sám**: `E0061 this function takes 0 arguments but 2 arguments were supplied`. Jména z
     `use super::*` mají nejnižší přednost, položka napsaná přímo v modulu je zakryje. Lék: test
     přejmenovat (`get_task_returns_task_by_number`).
   - `let title = tasks[1].title().clone();` a pak `get_task(&mut tasks, "2")`:
     `E0502 cannot borrow tasks as mutable because it is also borrowed as immutable`. `title()` vrací
     `&str` a `.clone()` zkopíruje **odkaz**, ne text. `title` tak dál drží `tasks` půjčené ke čtení
     (lekce 05). Vlastní kopie textu by byla `.to_string()`. Nakonec se ukázalo, že stačí napsat
     `"B"` natvrdo a pomocná proměnná vůbec není potřeba.
   - `assert_eq!(find_task(&tasks, "X"), None)` porovnává `Option<&Task>`, takže `PartialEq` dostal
     i `Task`.
4. **Revize.** `assert_ne!(title.trim(), "")` → `assert_eq!(…, "A")` (přesná kontrola),
   `assert!(tasks.len() == 2)` → `assert_eq!` (lepší výpis), v testu `start_all` přibyla kontrola, že se
   úkol `ToDo` opravdu spustil.

`src/error.rs`, jediná změna:
```rust
#[derive(Debug, PartialEq)]
pub enum TaskError {
```
`src/task.rs`, `PartialEq` u obou typů a testy na konci:
```rust
#[derive(Debug, Clone, PartialEq)]
enum TaskStatus { … }

#[derive(Debug, Clone, PartialEq)]
pub struct Task { … }

// … impl Task beze změny …

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn new_task_has_title() {
        assert_eq!(Task::new("A").title, "A");
    }

    #[test]
    fn new_task_is_todo() {
        assert_eq!(Task::new("A").status, TaskStatus::ToDo);
    }

    #[test]
    fn new_task_priority_is_none() {
        assert_eq!(Task::new("A").priority_label(), "None");
    }

    #[test]
    fn task_start() {
        let mut task = Task::new("A");
        task.start();
        assert_eq!(task.status, TaskStatus::InProgress);
    }

    #[test]
    fn task_set_priority_high() {
        let mut task = Task::new("A");
        task.set_priority(1);
        assert_eq!(task.priority_label(), "High");
    }

    #[test]
    fn task_set_priority_out_of_range() {
        let mut task = Task::new("A");
        task.set_priority(9);
        assert_eq!(task.priority_label(), "None");
    }

    #[test]
    fn task_rename() {
        let mut task = Task::new("A");
        task.rename("X");
        assert_eq!(task.title, "X");
    }
}
```
`src/list.rs`, testy na konci (funkce nahoře beze změny):
```rust
#[cfg(test)]
mod tests {
    use super::*;

    fn sample_tasks() -> Vec<Task> {
        vec![Task::new("A"), Task::new("B")]
    }

    #[test]
    fn parse_index_number() {
        assert_eq!(parse_index("3"), Ok(3));
    }

    #[test]
    fn parse_index_rejects_zero() {
        assert_eq!(parse_index("0"), Err(TaskError::ZeroIndex));
    }

    #[test]
    fn parse_index_rejects_empty() {
        assert_eq!(parse_index(""), Err(TaskError::MissingArgument));
    }

    #[test]
    fn parse_index_not_a_number() {
        assert_eq!(
            parse_index("abc"),
            Err(TaskError::NotANumber("abc".to_string()))
        );
    }

    #[test]
    fn get_task_returns_task_by_number() {
        assert_eq!(get_task(&mut sample_tasks(), "2").unwrap().title(), "B");
    }

    #[test]
    fn get_task_out_of_bounds() {
        assert_eq!(
            get_task(&mut sample_tasks(), "3").unwrap_err(),
            TaskError::NoSuchTask(3)
        );
    }

    #[test]
    fn start_all_only_uncompleted_tasks() {
        let mut tasks = sample_tasks();
        tasks[0].complete();
        start_all(&mut tasks);
        assert!(tasks[0].is_done());
        assert_eq!(tasks[1].symbol(), '~');
    }

    #[test]
    fn add_empty_task() {
        let mut tasks = sample_tasks();
        add_task(&mut tasks, "");
        assert_eq!(tasks.len(), 2);
    }

    #[test]
    fn find_task_result() {
        let tasks = sample_tasks();
        assert_eq!(find_task(&tasks, "A").unwrap().title(), "A");
        assert_eq!(find_task(&tasks, "X"), None);
    }
}
```

Poznámky:
- `&mut sample_tasks()` půjčí `Vec`, který nemá jméno. Žije do konce řádku, a to stačí: titulek se
  přečte a porovná na stejném řádku.
- Z `add_task` se při prázdném titulku vypíše `Title can't be empty!`. V `cargo test` ho nevidíš, protože
  test prošel a jeho výstup se schoval.
- Varování `find_task`, `rename`, `set_priority` *never used* v `cargo test` zmizela: testy je volají.
  V `cargo build` zůstávají, protože tam modul `tests` díky `#[cfg(test)]` vůbec není.
- Testy kontrolují logiku, ne čtení z klávesnice v `main`. Proto se vyplatí mít logiku ve funkcích,
  jako je `parse_index`, a `main` nechat tenký. Dobře se to testuje.
- Testy v `src/` jsou **unit testy** (zkouší jednotlivé funkce zevnitř modulu). Rust umí i *integrační
  testy* v adresáři `tests/`, ty volají jen veřejné věci zvenku. Hodí se pro knihovnu, ta přijde
  v lekci 15.

## Tahák

<img src="ferris/tahak-09.svg" alt="Krab Ferris drží nad hlavou váhu" width="110" align="right">

**Ferris radí:** Porovnáváš? `assert_eq!(skutečná, očekávaná)`. Očekávanou hodnotu napiš natvrdo a na každou věc jeden test.

| Zápis | Význam |
|---|---|
| `#[test]` | tahle funkce je test, spustí ji `cargo test` |
| `#[cfg(test)]` | přelož jen při testech |
| `mod tests { … }` | modul s testy přímo v souboru, dítě testovaného modulu |
| `use super::*;` | všechno z rodiče (`*` = všechno), včetně soukromých položek |
| `assert!(podmínka)` | selže, když je `false`, hodnoty nevypíše |
| `assert_eq!(skutečná, očekávaná)` | selže, když se liší, vypíše `left` a `right` |
| `assert_ne!(a, b)` | selže, když se rovnají |
| `assert!(matches!(x, vzor))` | pasuje na vzor? Nepotřebuje `PartialEq` |
| `#[derive(PartialEq)]` | typ jde porovnat přes `==` (a tedy v `assert_eq!`) |
| `.unwrap()` / `.unwrap_err()` | v testu v pořádku, špatná varianta = test selže |
| `cargo test` | přelož a spusť všechny testy |
| `cargo test parse` | jen testy, které mají `parse` v cestě |
| `cargo test -- --nocapture` | ukaž i výstup `println!` z testů, které prošly |

**Časté chyby**

| Hláška | Příčina | Lék |
|---|---|---|
| `the usage of assert_eq! is likely invalid in item context` | kontrola stojí přímo v `mod tests` | obalit do `#[test] fn … { }` |
| `unused import: super::*` | v modulu není žádný test, který by import použil | napsat testy jako funkce |
| `E0369 binary operation == cannot be applied` | typ nemá `PartialEq` | `#[derive(PartialEq)]`, nebo `assert!(matches!(…))` |
| `E0308 expected String, found &str` | varianta nese `String` | `"abc".to_string()` |
| `E0061 this function takes 0 arguments` | test se jmenuje stejně jako testovaná funkce | test přejmenovat |
| `E0502 … also borrowed as immutable` | `&str` z `title()` drží výpůjčku i po `.clone()` | očekávanou hodnotu natvrdo, nebo `.to_string()` |
| `assertion failed: …` bez hodnot | `assert!(a == b)` | `assert_eq!(a, b)` |
| `function sample_tasks is never used` v `cargo build` | chybí `#[cfg(test)]` | přidat ho nad `mod tests` |

## Procvičení
1. Napiš test pro `cancel()` a test, který ověří `symbol()` u všech čtyř stavů. Kolik testů na to
   potřebuješ a proč?
2. Schválně rozbij `parse_index`: smaž kontrolu `if n == 0`. Který test spadne a co ukáže v `left` /
   `right`? Uhádni to dřív, než spustíš `cargo test`. Pak kód vrať.
3. Přepiš `parse_index_not_a_number` na `assert!(matches!(…))` se vzorem `NotANumber(_)`. Co tím test
   přestane kontrolovat? A co ukáže, když ho rozbiješ?

## Odkazy
- [Infografika: Zkušebna s váhou](infografika/09-testy-infografika.html) – testy jako zkušební stolky, `assert_eq!` jako váha s miskami `left`/`right`, `PartialEq` jako nálepka „smí na váhu“, `#[cfg(test)]` jako zkušebna za dílnou + hřiště „rozbij kód a pusť `cargo test`“ s filtrem (otevřít v prohlížeči)
- [Rust Book 11.1 – How to Write Tests](https://doc.rust-lang.org/book/ch11-01-writing-tests.html) (`#[test]`, `assert_eq!`, `PartialEq` a `Debug`)
- [Rust Book 11.2 – Controlling How Tests Are Run](https://doc.rust-lang.org/book/ch11-02-running-tests.html) (filtr, `--nocapture`, paralelní běh)
- [Rust Book 11.3 – Test Organization](https://doc.rust-lang.org/book/ch11-03-test-organization.html) (`#[cfg(test)]`, testování soukromých funkcí)
- [Rust By Example – Unit testing](https://doc.rust-lang.org/rust-by-example/testing/unit_testing.html)
- [std – `assert_eq!`](https://doc.rust-lang.org/std/macro.assert_eq.html)

---

[← 08 – Moduly](08-moduly.md) · [Obsah](README.md) · [GitHub](https://github.com/akabourek/todo-rs)
