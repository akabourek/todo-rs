# 05 – Vlastnictví a výpůjčky

## Cíl
Rozumíme tomu, kdo v Rustu „vlastní“ data, co je přesun (move), kopie a klon, a jak si data jen půjčit
přes `&` a `&mut`. Výpis a přidávání úkolů jsme vytáhli do samostatných funkcí, které si vektor půjčují.

## Nové pojmy a syntaxe

### Vlastnictví (ownership)
Každá hodnota má **právě jednoho vlastníka** (proměnnou). Když vlastník skončí (konec bloku `}`),
hodnota se uvolní – bez garbage collectoru i bez ručního `free`.
```rust
{
    let t = Task::new("Nákup");   // t vlastní Task (a v něm String)
}                                 // tady t končí → Task i String se uvolní
```

### Přesun (move)
Přiřazení nebo předání do funkce vlastnictví **přesune**. Stará proměnná je pak neplatná:
```rust
let a = Task::new("Test");
let b = a;               // vlastnictví přešlo z a na b
println!("{}", a.title); // ❌ E0382: borrow of moved value: `a`
```
Proč: kdyby `a` i `b` vlastnily stejný `String`, oba by ho na konci uvolnily (dvojité uvolnění).
Rust tomu brání už při kompilaci.

Totéž platí pro funkce – `fn print_tasks(tasks: Vec<Task>)` si vektor **vezme**, a po zavolání
`print_tasks(tasks);` už `tasks` v `main` nejde použít.

### `Copy` a `.clone()`
- Malé jednoduché typy (`u8`, `i32`, `bool`, `char`, …) jsou `Copy` – místo přesunu se zkopírují.
  `let x = 5; let y = x;` → `x` jde používat dál.
- `String`, `Vec`, `Task` `Copy` nejsou. Dvě nezávislé kopie = výslovně `a.clone()`.
- Klonovat jde jen typ s `#[derive(Clone)]`. U `Task` musí `Clone` umět **i všechna jeho pole**,
  proto `derive(Clone)` potřebuje i `TaskStatus`:
  ```rust
  #[derive(Debug, Clone)]
  enum TaskStatus { ... }

  #[derive(Debug, Clone)]
  struct Task { ... }
  ```
- `derive(A, B)` = víc odvozených schopností najednou, oddělených čárkou.

### Výpůjčka (borrow) – `&` a `&mut`
| zápis | čti | význam |
|---|---|---|
| `&x` | „reference na x“ | půjčka jen pro čtení, vlastník se nemění |
| `&mut x` | „měnitelná reference na x“ | půjčka pro zápis; `x` musí být `let mut` |
| `t: &Task` | (v typu) „reference na Task“ | funkce si Task jen půjčí |
| `*r` | „dereference“ – hodnota, na kterou `r` ukazuje | `*r += 1;` u `r: &mut u8` |

- `&` má dva významy podle místa: ve **výrazu** (`&tasks`) referenci *vytváří*, v **typu**
  (`tasks: &[Task]`) říká *„tohle je reference“*.
- U `.` Rust dereferencuje sám: `task.title`, ne `(*task).title`.
- `&mut` se píše **i při volání** (`add_task(&mut tasks, ...)`) – na první pohled je vidět, kde se data můžou změnit.

### Pravidla výpůjček (borrow checker)
V jednu chvíli platí **buď** libovolně mnoho `&` (čtenářů), **nebo** právě jedna `&mut` (zapisovatel) –
nikdy obojí. A reference nesmí přežít vlastníka.
```rust
let first = &tasks[0];                // čtenář
add_task(&mut tasks, "Another task"); // ❌ E0502: zapisovatel, zatímco čtenář ještě žije
println!("{}", first.title);          // ← tady se čtenář ještě používá
```
Proč je to nebezpečné: `push` může vektor při nedostatku místa přesunout jinam v paměti a `first` by
ukazoval do uvolněné paměti.

Výpůjčka trvá jen **do posledního použití** reference, ne do konce bloku. Po přehození to projde:
```rust
let first = &tasks[0];
println!("{}", first.title);          // poslední použití first → výpůjčka končí
add_task(&mut tasks, "Another task"); // ✅ teď už je zapisovatel sám
```

### Slice `&[T]`
- `[Task]` = **slice (řez)** – souvislá řada `Task`ů v paměti, bez ohledu na to, kdo ji vlastní.
- `&[Task]` = reference na takovou řadu. Pasuje na `Vec<Task>`, pole `[Task; 3]` i kus vektoru `&tasks[1..3]`.
- `&Vec<Task>` se na `&[Task]` převede automaticky – volání `print_tasks(&tasks)` se nemění.
- Pravidlo: funkce, která jen **čte**, bere `&[T]` (clippy u `&Vec<T>` hlásí `ptr_arg`).
  Funkce, která mění **délku** (`push`), potřebuje `&mut Vec<T>` – slice umí jen existující prvky.

### Co jsme už používali a teď tomu rozumíme
| zápis | znamená |
|---|---|
| `fn symbol(&self)` | metoda si Task půjčí na čtení |
| `fn rename(&mut self, ...)` | metoda si Task půjčí na zápis |
| `fn new(title: &str)` + `.to_string()` | text si jen půjčí, `.to_string()` vyrobí vlastní `String` pro Task |
| `tasks.iter()` | prochází reference `&Task` → `tasks` po smyčce existuje dál |

### Metoda se `self` (bez `&`) a konvence názvů
`self` bez `&` je obyčejný parametr předaný hodnotou – metoda si objekt **vezme celý** a po zavolání
původní proměnná nic nevlastní:
```rust
fn into_title(self) -> String {
    self.title
}

let task = tasks.remove(0);       // remove vrací Task (vlastněný), ne &Task
let title = task.into_title();    // task se přesunul do metody
println!("{}", task.title);       // ❌ E0382: borrow of moved value: `task`
```
Volat ji jde jen na hodnotě, kterou **vlastníš**. Na `&Task` ani na `tasks[0]` (to pořád patří vektoru)
to nejde → `E0507: cannot move out of ...` – půjčenou věc nejde dát pryč.

Z názvu metody se dá poznat, co dělá se `self` (konvence standardní knihovny):

| předpona | `self` | význam | příklad |
|---|---|---|---|
| `as_…` | `&self` | levný „pohled“ na totéž | `s.as_str()` |
| `to_…` | `&self` | vyrobí novou kopii, originál zůstává | `"abc".to_string()` |
| `into_…` | `self` | spotřebuje originál a přemění ho | `task.into_title()` |

## Postup
1. **Experiment s přesunem** – `let b = a;` a pak použití `a` → `E0382`. Oprava přes `a.clone()`;
   kompilátor dovedl k přidání `Clone` do `derive` u `Task` i `TaskStatus`.
2. **Funkce na výpis** – smyčka z `main` se přesunula do vlastní funkce (i s počítáním hotových):
   ```rust
   fn print_tasks(tasks: &[Task]) {
       let count_done = tasks.iter().filter(|task| task.is_done()).count();
       tasks.iter().enumerate().for_each(|(index, task)| {
           println!("{}: [{}] {}", index + 1, task.symbol(), task.title);
           println!("   Priority: {}", task.priority_label());
       });
       println!("Done: {}/{}", count_done, tasks.len());
   }
   ```
   Nejdřív s `tasks: Vec<Task>` (přesun → `tasks` v `main` pak nejde použít), pak `&Vec<Task>`,
   nakonec `&[Task]` podle rady clippy.
3. **Funkce na přidání** – půjčka pro zápis:
   ```rust
   fn add_task(tasks: &mut Vec<Task>, title: &str) {
       tasks.push(Task::new(title));
   }

   // v main:
   add_task(&mut tasks, "New task");
   print_tasks(&tasks);
   ```
4. **Experiment s pravidly výpůjček** – `&tasks[0]` + `add_task(&mut tasks, ...)` → `E0502`;
   přehozením řádků (čtenář skončí dřív) prošlo.
5. **Procvičení v kódu** – měnitelný průchod slicem a hledání, které vrací výpůjčku:
   ```rust
   fn start_all(tasks: &mut [Task]) {
       tasks
           .iter_mut()                                              // prvky jako &mut Task
           .filter(|task| matches!(task.status, TaskStatus::ToDo)) // jen ty, co ještě čekají
           .for_each(|task| task.start());
   }

   fn find_task<'a>(tasks: &'a [Task], title: &str) -> Option<&'a Task> {
       tasks.iter().find(|task| task.title == title)
   }
   ```
   - `iter_mut()` = jako `iter()`, ale dává `&mut` – prvky jde měnit. Stačí `&mut [Task]`, protože
     se mění jen prvky, ne délka.
   - `.find(|x| podmínka)` vrátí `Some(první vyhovující)` nebo `None`.
   - `<'a>` / `&'a` = **lifetime** (doba platnosti výpůjčky), čti „lifetime a“. Říká, že vrácená
     reference je půjčená z `tasks`. Kompilátor ji chce, protože funkce bere dvě reference a neví,
     ze které výsledek pochází. Podrobně v lekci 14.
   - Pozor na `#[warn(dead_code)]` vs `#[allow(dead_code)]`: `warn` = „varuj“ (výchozí stav, nic
     nezmění), `allow` = „povol, nevaruj“.

## Tahák
| situace | zápis |
|---|---|
| předat a už nepotřebovat | `f(x)`, parametr `x: T` (přesun) |
| jen přečíst | `f(&x)`, parametr `x: &T`, u vektoru `x: &[T]` |
| změnit | `f(&mut x)`, parametr `x: &mut T`; `x` musí být `let mut` |
| potřebuju vlastní kopii | `x.clone()` + `#[derive(Clone)]` |
| malé typy (`u8`, `bool`, `char`…) | kopírují se samy (`Copy`) |

- Pravidlo: **mnoho `&` NEBO jedna `&mut`**, nikdy obojí naráz.
- Výpůjčka končí posledním použitím reference.
- Názvy metod: `as_…` / `to_…` = `&self`, `into_…` = `self` (spotřebuje hodnotu).
- `E0382` = použití přesunuté hodnoty, `E0502` = `&` a `&mut` současně,
  `E0507` = pokus přesunout hodnotu zpod reference / z indexu vektoru.

## Procvičení
1. Napiš `fn start_all(tasks: &mut [Task])`, která všem úkolům ve stavu `ToDo` zavolá `start()`.
   Proč tady stačí `&mut [Task]` a nepotřebuješ `&mut Vec<Task>`? (nápověda: `iter_mut()`)
2. Napiš `fn find_task(tasks: &[Task], title: &str) -> Option<&Task>`, která vrátí první úkol
   s daným názvem. Zkus pak výsledek použít a mezitím zavolat `add_task` – jakou chybu dostaneš a proč?
3. Do `impl Task` přidej metodu `fn into_title(self) -> String`, která vrátí název (bez `&` u `self`!).
   Co se stane s úkolem po jejím zavolání? Zkus ho pak použít.
   Pozor: volat ji jde jen na úkolu, který **vlastníš** (`let t = Task::new(...)`, `tasks.pop()`,
   `tasks.remove(i)`). Na `&Task` (např. z `find_task`) skončí `E0507` – půjčenou věc nejde dát pryč.

## Odkazy
- [Infografika: Kdo drží krabici?](infografika/05-vlastnictvi-infografika.html) – celá lekce na obrázcích s krabicemi a interaktivní hřiště (otevřít v prohlížeči)
- [Rust Book 4.1 – What is Ownership?](https://doc.rust-lang.org/book/ch04-01-what-is-ownership.html)
- [Rust Book 4.2 – References and Borrowing](https://doc.rust-lang.org/book/ch04-02-references-and-borrowing.html)
- [Rust Book 4.3 – The Slice Type](https://doc.rust-lang.org/book/ch04-03-slices.html)
- [Rust Error Index – E0382](https://doc.rust-lang.org/error_codes/E0382.html), [E0502](https://doc.rust-lang.org/error_codes/E0502.html)
- [Clippy – ptr_arg](https://rust-lang.github.io/rust-clippy/master/index.html#ptr_arg)
