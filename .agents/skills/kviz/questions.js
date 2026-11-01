// Otázky kvízu. `checks` se ověřují na skutečném rustc (scripts/verify.js) a do stránky se nedostanou.
// Kontrola: err = kód chyby ('any' = jakákoli), out = přesný výstup, panic, warn, stderr, stdin,
// src = vlastní zdroják místo `code`, tag = zdroják src/main.rs z gitového tagu.
const R = String.raw;

const TASK = R`struct Task {
    title: String,
    done: bool,
}

impl Task {
    fn new(title: &str) -> Self {
        Self { title: title.to_string(), done: false }
    }
    fn complete(&mut self) {
        self.done = true;
    }
}
`;

module.exports = [
// ───────── 00 ─────────
{ l: 0, kind: 'Pojem',
  q: "Který příkaz jen zkontroluje chyby a **nevyrobí** spustitelný program?",
  opts: [
    { t: "`cargo check`", ok: true },
    { t: "`cargo build`", why: "`build` program přeloží do `target/debug/`." },
    { t: "`cargo run`", why: "`run` program přeloží a rovnou spustí." },
    { t: "`cargo fmt`", why: "`fmt` kód jen naformátuje, chyby nehledá." },
  ],
  ex: "`cargo check` je rychlejší než `build`, protože nevyrábí binárku. Proto se hodí na průběžnou kontrolu." },
{ l: 0, kind: 'Pojem',
  q: "Který nástroj ti ve VS Code ukazuje chyby už při psaní a napovídá typy proměnných?",
  opts: [
    { t: "`rust-analyzer`", ok: true },
    { t: "`rustup`", why: "`rustup` spravuje nainstalované verze Rustu." },
    { t: "`rustc`", why: "`rustc` je kompilátor, přímo ho skoro nevoláme." },
    { t: "`cargo`", why: "`cargo` je build systém a správce balíčků, v editoru nenapovídá." },
  ],
  ex: "`rust-analyzer` je rozšíření do editoru. Ostatní tři nástroje běží v terminálu." },

// ───────── 01 ─────────
{ l: 1, kind: 'Přeloží se?',
  q: "Co se stane s tímhle programem?",
  code: R`fn main() {
    let count = 5;
    count += 1;
    println!("{count}");
}`,
  checks: [{ err: 'E0384' }],
  opts: [
    { t: "Nepřeloží se: `count` není `mut`", ok: true },
    { t: "Přeloží se a vypíše `6`", why: "Proměnná bez `mut` je neměnná, `+=` by ji měnilo." },
    { t: "Přeloží se a vypíše `5`", why: "Rust změnu tiše nezahodí, ohlásí ji jako chybu." },
    { t: "Přeloží se, ale za běhu spadne", why: "Tohle chytí už kompilátor, program vůbec nevznikne." },
  ],
  ex: "`let` vytvoří neměnnou proměnnou. Měnitelná se píše `let mut count = 5;`. Chyba je `E0384`: *cannot assign twice to immutable variable*." },
{ l: 1, kind: 'Přeloží se?',
  q: "Co se stane s tímhle řádkem?",
  code: R`fn main() {
    let list = vec![1, 2, 3];
    println!("Count: {list.len()}");
}`,
  checks: [{ err: 'any' }],
  opts: [
    { t: "Nepřeloží se: do `{…}` patří jen jméno proměnné", ok: true },
    { t: "Přeloží se a vypíše `Count: 3`", why: "Volání metody je výraz a výraz do `{…}` napsat nejde." },
    { t: "Přeloží se a vypíše doslova `{list.len()}`", why: "Složené závorky ve formátu `println!` vždy něco znamenají." },
    { t: "Nepřeloží se: `vec!` nemá metodu `len`", why: "`len()` má `Vec` i pole, problém je v zápisu uvnitř `{…}`." },
  ],
  ex: "Výraz patří za čárku: `println!(\"Count: {}\", list.len());`. Prázdné `{}` vezme další argument v pořadí." },
{ l: 1, kind: 'Přeloží se?',
  q: "V cyklu chybí `&`. Co to udělá?",
  code: R`fn main() {
    let list = vec![String::from("Apple"), String::from("Banana")];
    for entry in list {
        println!("{entry}");
    }
    println!("{}", list.len());
}`,
  checks: [{ err: 'E0382' }],
  opts: [
    { t: "Nepřeloží se: cyklus si `list` vzal, po něm už nejde použít", ok: true },
    { t: "Přeloží se: vypíše oba prvky a pak `2`", why: "To by platilo pro `for entry in &list`." },
    { t: "Přeloží se: vypíše oba prvky a pak `0`", why: "Vektor se během cyklu nevyprázdní, ale přesune se. To kompilátor nedovolí." },
    { t: "Nepřeloží se: `for` neumí projít `Vec` bez `.iter()`", why: "Projít ho umí. Háček je v tom, že ho přitom spotřebuje." },
  ],
  ex: "`&list` znamená „jen si půjčím“. Bez `&` se vlastnictví přesune do cyklu a poslední řádek skončí chybou `E0382`: *borrow of moved value*." },
{ l: 1, kind: 'Co vypíše?',
  q: "Co tenhle program vypíše?",
  code: R`fn main() {
    let list = ["Apple", "Banana"];
    for (index, entry) in list.iter().enumerate() {
        println!("{index}: {entry}");
    }
}`,
  checks: [{ out: "0: Apple\n1: Banana\n" }],
  opts: [
    { code: "0: Apple\n1: Banana", ok: true },
    { code: "1: Apple\n2: Banana", why: "`enumerate()` čísluje od 0. Proto v lekci píšeme `index + 1`." },
    { code: "Apple: 0\nBanana: 1", why: "Pořadí ve dvojici je `(index, prvek)` a výpis ho drží." },
    { code: "2: Apple\n2: Banana", why: "`index` je pořadí prvku, ne délka seznamu." },
  ],
  ex: "`enumerate()` dává dvojice `(0, \"Apple\")`, `(1, \"Banana\")` a vzor `(index, entry)` je rozbalí do dvou proměnných." },
{ l: 1, kind: 'Přeloží se?',
  q: "Pole máme jako `mut`. Co se stane?",
  code: R`fn main() {
    let mut list = ["Apple", "Banana"];
    list.push("Cherry");
    println!("{}", list.len());
}`,
  checks: [{ err: 'E0599' }],
  opts: [
    { t: "Nepřeloží se: pole má pevnou délku a `push` nemá", ok: true },
    { t: "Přeloží se a vypíše `3`", why: "`mut` dovolí měnit prvky pole, délku ale ne." },
    { t: "Přeloží se, ale za běhu spadne na plném poli", why: "Metoda `push` u pole vůbec neexistuje, takže to neprojde už překladem." },
    { t: "Nepřeloží se: do pole nejde dávat `&str`", why: "Pole `&str` je v pořádku, je to typ `[&str; 2]`." },
  ],
  ex: "Co má růst, patří do `Vec`: `let mut list = vec![\"Apple\", \"Banana\"];`. Pak `push` funguje." },
{ l: 1, kind: 'Syntaxe',
  q: "Co je v tomhle řádku zápis `|x| x * 2`?",
  code: R`fn main() {
    let double = |x| x * 2;
    println!("{}", double(21));
}`,
  checks: [{ out: "42\n" }],
  opts: [
    { t: "Funkce bez jména (closure) s parametrem `x`", ok: true },
    { t: "Bitové OR mezi `x` a výrazem `x * 2`", why: "Bitové OR je `a | b`. Na začátku výrazu jde o closure." },
    { t: "Absolutní hodnota čísla `x`, vynásobená dvěma", why: "Svislítka tu nejsou matematický zápis, Rust je čte jinak." },
    { t: "Vzor „nebo“, jaký se píše ve větvi `match`", why: "`A | B` je „nebo“ ve vzoru. Tady jsou svislítka kolem parametru." },
  ],
  ex: "Mezi svislítky jsou parametry, za nimi tělo. Odpovídá `fn double(x: i32) -> i32 { x * 2 }`, jen bez jména. Program vypíše `42`." },

// ───────── 02 ─────────
{ l: 2, kind: 'Pojem',
  q: "Program se zastavil na breakpointu na řádku 5. Co platí?",
  opts: [
    { t: "Řádek 5 se ještě neprovedl", ok: true },
    { t: "Řádek 5 se právě celý provedl", why: "Breakpoint zastaví těsně před řádkem." },
    { t: "Funkce doběhla a čeká se na další volání", why: "Funkce běží dál až po tvém pokynu, teď stojí na řádku 5." },
    { t: "Proměnné teď nejde prohlížet, ladění je pozastavené", why: "Pauza je přesně chvíle, kdy se do panelu **Variables** díváš." },
  ],
  ex: "Breakpoint znamená „tady zastav, než se řádek provede“. Proměnná přiřazená na tomto řádku proto ještě nemá novou hodnotu." },
{ l: 2, kind: 'Pojem',
  q: "Debugger stojí na řádku `task.start();` a chceš se podívat **dovnitř** metody `start`. Kterou klávesu stiskneš?",
  opts: [
    { t: "`F11`", ok: true },
    { t: "`F10`", why: "`F10` je step over: řádek provede, ale dovnitř nevstoupí." },
    { t: "`F9`", why: "`F9` jen přepíná breakpoint na řádku." },
    { t: "`F5`", why: "`F5` pokračuje až k dalšímu breakpointu." },
  ],
  ex: "`F11` je step into (dovnitř), `F10` step over (přes) a `Shift+F11` step out (ven o úroveň výš)." },
{ l: 2, kind: 'Co vypíše?',
  q: "Co udělá `dbg!` uprostřed výrazu?",
  code: R`fn main() {
    let x = dbg!(2 + 3) * 2;
    println!("{x}");
}`,
  checks: [{ out: "10\n", stderr: "2 + 3 = 5" }],
  opts: [
    { t: "Vypíše `2 + 3 = 5` na stderr a vrátí `5`, takže `x` je `10`", ok: true },
    { t: "Nepřeloží se: `dbg!` nic nevrací, takže násobit nejde", why: "`dbg!` hodnotu vrací dál, proto jde vložit doprostřed výrazu." },
    { t: "Vypíše `2 + 3 = 5` na stdout a `x` zůstane `5`", why: "Násobení `* 2` proběhne normálně a výpis jde na stderr." },
    { t: "Nevypíše nic navíc, `dbg!` funguje jen v debuggeru", why: "`dbg!` funguje i při obyčejném `cargo run`." },
  ],
  ex: "`dbg!` vypíše soubor, řádek, výraz i hodnotu a hodnotu pošle dál. Do hotového kódu nepatří, je to dočasná pomůcka." },
{ l: 2, kind: 'Pojem',
  q: "Program čte z klávesnice, ale při ladění do něj nejde psát. Co změníš v `.vscode/launch.json`?",
  opts: [
    { t: "`\"terminal\": \"integrated\"`", ok: true },
    { t: "`\"request\": \"attach\"`", why: "`attach` se připojí k už běžícímu programu, se vstupem to nesouvisí." },
    { t: "`\"sourceLanguages\": [\"rust\"]`", why: "Tohle zařídí čitelné zobrazení `Vec` a `String` v debuggeru." },
    { t: "`\"cwd\": \"${workspaceFolder}\"`", why: "`cwd` je pracovní adresář, ne vstup z klávesnice." },
  ],
  ex: "S `\"terminal\": \"integrated\"` běží program v terminálu VS Code a funguje výstup i vstup. Varianta `\"console\"` vstup neumí." },

// ───────── 03 ─────────
{ l: 3, kind: 'Přeloží se?',
  q: "Za výrazem je středník navíc. Co se stane?",
  code: R`fn double(x: i32) -> i32 {
    x * 2;
}

fn main() {
    println!("{}", double(4));
}`,
  checks: [{ err: 'E0308' }],
  opts: [
    { t: "Nepřeloží se: se `;` funkce nevrací `i32`", ok: true },
    { t: "Přeloží se a vypíše `8`", why: "Se středníkem je to příkaz a jeho hodnota se zahodí." },
    { t: "Přeloží se a vypíše `0`", why: "Rust nedoplňuje výchozí návratovou hodnotu." },
    { t: "Nepřeloží se: vracet jde jen přes `return`", why: "Poslední výraz **bez** středníku je návratová hodnota, `return` tam není potřeba." },
  ],
  ex: "Poslední výraz bez `;` je návratová hodnota. S `;` funkce nevrací nic, proto chyba `E0308`: *mismatched types*." },
{ l: 3, kind: 'Který zápis?',
  q: "Metoda `complete` nastaví úkol jako hotový a úkol má dál fungovat. Jak bude vypadat její hlavička?",
  opts: [
    { t: "`fn complete(&mut self)`", ok: true },
    { t: "`fn complete(&self)`", why: "`&self` si hodnotu půjčí jen ke čtení, přiřadit do pole nedovolí." },
    { t: "`fn complete(self)`", why: "`self` bez `&` si úkol vezme celý a po volání ho už nemáš." },
    { t: "`fn complete()`", why: "Bez `self` je to asociovaná funkce, nemá žádný úkol, který by měnila." },
  ],
  ex: "`&mut self` = půjčka ke změně, `&self` = půjčka ke čtení, bez `self` = funkce typu volaná přes `Task::…`." },
{ l: 3, kind: 'Přeloží se?',
  q: "Co se stane při volání `complete` na tomhle úkolu?",
  code: TASK + R`
fn main() {
    let task = Task::new("Test");
    task.complete();
    println!("{} {}", task.title, task.done);
}`,
  checks: [{ err: 'E0596' }],
  opts: [
    { t: "Nepřeloží se: `task` není `mut`, ale metoda ho mění", ok: true },
    { t: "Přeloží se a vypíše `Test true`", why: "Metoda s `&mut self` potřebuje měnitelnou proměnnou." },
    { t: "Přeloží se a vypíše `Test false`", why: "Rust změnu tiše neignoruje, nahlásí ji jako chybu." },
    { t: "Nepřeloží se: `Task::new` musí být `mut`", why: "`mut` patří k proměnné `task`, ne k funkci." },
  ],
  ex: "`mut` u proměnné dovolí měnit hodnotu, proto `let mut task = …`. Chyba je `E0596`: kompilátor hlásí, že `task` *is not declared as mutable*." },
{ l: 3, kind: 'Pojem',
  q: "Jaký typ textu použijeme podle pravidla z lekce 03?",
  checks: [
    { src: "struct T { title: &str }\nfn main() {}\n", err: 'E0106' },
    { src: "fn f(s: &str) -> usize { s.len() }\nfn main() { let o = String::from(\"ab\"); println!(\"{}\", f(\"a\") + f(&o)); }\n", out: "3\n" },
  ],
  opts: [
    { t: "Pole struktury `String`, parametr funkce `&str`", ok: true },
    { t: "Pole struktury `&str`, parametr funkce `String`", why: "`&str` v poli by vyžadovalo lifetimes a `String` v parametru by si text vzal." },
    { t: "Obojí `String`, aby text vždy někomu patřil", why: "Parametr `String` by volajícímu text sebral a literál by nepřijal." },
    { t: "Obojí `&str`, protože je to levnější", why: "Pole `&str` se bez lifetimes nepřeloží (`E0106`)." },
  ],
  ex: "Struktura svá data vlastní, proto `String`. Parametr si text jen půjčí a `&str` přijme literál i `&String`." },
{ l: 3, kind: 'Přeloží se?',
  q: "Struktura nemá nad sebou žádný atribut. Co udělá výpis?",
  code: R`struct Point {
    x: i32,
    y: i32,
}

fn main() {
    let p = Point { x: 1, y: 2 };
    println!("{:?}", p);
}`,
  checks: [{ err: 'E0277' }],
  opts: [
    { t: "Nepřeloží se: chybí `#[derive(Debug)]`", ok: true },
    { t: "Přeloží se a vypíše `Point { x: 1, y: 2 }`", why: "Takhle by to vypadalo až s `#[derive(Debug)]`." },
    { t: "Přeloží se a vypíše `1 2`", why: "Rust pole sám neskládá. Ladicí výpis musí typ umět." },
    { t: "Nepřeloží se: místo `{:?}` musí být `{}`", why: "`{}` u vlastního typu také nefunguje, ten by potřeboval `Display`." },
  ],
  ex: "`{:?}` potřebuje schopnost `Debug` a tu vygeneruje `#[derive(Debug)]`. Bez ní jsou `{:?}` i `dbg!` chyba `E0277`." },
{ l: 3, kind: 'Syntaxe',
  q: "Co znamená `Self { x, y }` na posledním řádku funkce?",
  code: R`#[derive(Debug)]
struct Point { x: i32, y: i32 }

impl Point {
    fn new(x: i32, y: i32) -> Self {
        Self { x, y }
    }
}

fn main() {
    println!("{:?}", Point::new(1, 2));
}`,
  checks: [{ out: "Point { x: 1, y: 2 }\n" }],
  opts: [
    { t: "Vrátí nový `Point`, zkratka za `Self { x: x, y: y }`", ok: true },
    { t: "Vytvoří blok kódu, který vrátí dvojici `(x, y)`", why: "Dvojice se píše v kulatých závorkách, tohle je struktura." },
    { t: "Změní pole `x` a `y` na už existujícím `self`", why: "Funkce nemá parametr `self`, takže nic existujícího nemění." },
    { t: "Zavolá metodu `Self` s argumenty `x` a `y`", why: "`Self` není metoda, ale „typ, ve kterém jsem“, tady `Point`." },
  ],
  ex: "`Self` je uvnitř `impl Point` totéž co `Point`. Když se proměnná jmenuje stejně jako pole, stačí napsat jen jméno. Bez `;` je to návratová hodnota." },

// ───────── 04 ─────────
{ l: 4, kind: 'Syntaxe',
  q: "Proč se píše `TaskStatus::Done`, ale `task.status`?",
  opts: [
    { t: "`::` sahá do typu, `.` do hodnoty", ok: true },
    { t: "`::` je pro čtení, `.` pro zápis", why: "Rozdíl není v čtení a zápisu, ale v tom, do čeho saháš." },
    { t: "`::` je pro enumy, `.` pro struktury", why: "`Task::new` je `::` u struktury, takže to s enumem nesouvisí." },
    { t: "`::` je starší zápis, `.` novější", why: "Oba zápisy platí vedle sebe a každý znamená něco jiného." },
  ],
  ex: "`TaskStatus::Done` = varianta z typu, `Task::new` = funkce z typu. `task.status` = pole hodnoty, `task.start()` = metoda hodnoty." },
{ l: 4, kind: 'Přeloží se?',
  q: "Do enumu přibyla varianta `Canceled`, metody zůstaly beze změny. Co kompilátor nahlásí?",
  code: R`enum TaskStatus { ToDo, Done, Canceled }

struct Task { status: TaskStatus }

impl Task {
    fn symbol(&self) -> char {
        match self.status {
            TaskStatus::ToDo => ' ',
            TaskStatus::Done => 'X',
        }
    }

    fn is_done(&self) -> bool {
        matches!(self.status, TaskStatus::Done)
    }
}

fn main() {
    let task = Task { status: TaskStatus::Canceled };
    println!("{} {}", task.symbol(), task.is_done());
}`,
  checks: [{ err: 'E0004', count: 1 }],
  opts: [
    { t: "Chybu jen v `symbol`: `match` musí pokrýt všechny varianty", ok: true },
    { t: "Chybu jen v `is_done`: `matches!` musí znát všechny varianty", why: "Je to naopak. V `matches!` je schované `_`, takže úplnost nehlídá." },
    { t: "Chybu v obou metodách: nová varianta chybí v `symbol` i `is_done`", why: "`matches!` je otázka ano/ne, ostatní varianty tiše dají `false`." },
    { t: "Nic: přidat variantu do enumu je vždy bezpečné", why: "Právě kontrola úplnosti tě u `match` dovede ke všem místům, kde varianta chybí." },
  ],
  ex: "Plný `match` hlídá úplnost (`E0004`). `matches!` a větev `_` ji vypínají, proto na rozvětvení s různými výsledky patří plný `match`." },
{ l: 4, kind: 'Přeloží se?',
  q: "Co se stane s tímhle přiřazením?",
  code: R`fn main() {
    let symbol: char = "X";
    println!("{symbol}");
}`,
  checks: [{ err: 'E0308' }],
  opts: [
    { t: "Nepřeloží se: `\"X\"` je `&str`, `char` se píše `'X'`", ok: true },
    { t: "Přeloží se: text s jedním znakem se převede na `char`", why: "Rust typy tiše nepřevádí, a `\"X\"` je pořád text." },
    { t: "Přeloží se: jednoduché a dvojité uvozovky jsou zaměnitelné", why: "To platí v Pythonu nebo JS, v Rustu je to rozdíl v typu." },
    { t: "Nepřeloží se: typ `char` v Rustu neexistuje", why: "`char` existuje, `symbol()` ho z lekce vrací." },
  ],
  ex: "Jednoduché uvozovky = `char` (právě jeden znak), dvojité = `&str` (text libovolné délky)." },
{ l: 4, kind: 'Co vypíše?',
  q: "Seznam má tři prvky a program sáhne na index 10. Co se stane?",
  code: R`fn main() {
    let list = vec![1, 2, 3];
    let x = list[10];
    println!("{x}");
}`,
  checks: [{ panic: "index out of bounds: the len is 3 but the index is 10" }],
  opts: [
    { t: "Přeloží se, ale za běhu spadne: *index out of bounds*", ok: true },
    { t: "Přeloží se a `x` je `None`", why: "`None` vrátí `list.get(10)`, ale `[ ]` vrací přímo prvek." },
    { t: "Přeloží se a `x` je `0`", why: "Rust nevrací výchozí hodnotu ani nesahá mimo paměť." },
    { t: "Nepřeloží se: kompilátor zná délku každého `Vec`", why: "Délka `Vec` se mění za běhu, takže kompilátor ji nezná." },
  ],
  ex: "`list[10]` mimo rozsah znamená paniku. Když index být nemusí (zadal ho uživatel), použij `list.get(10)`, které vrátí `Option<&T>`." },
{ l: 4, kind: 'Co vypíše?',
  q: "Která větev se provede?",
  code: R`fn main() {
    let priority: Option<u8> = Some(7);
    match priority {
        Some(1) => println!("High"),
        Some(_) => println!("Other"),
        None => println!("Empty"),
    }
}`,
  checks: [{ out: "Other\n" }],
  opts: [
    { code: "Other", ok: true },
    { code: "High", why: "`Some(1)` sedí jen na hodnotu přesně `1`." },
    { code: "Empty", why: "`None` by to bylo bez hodnoty, tady je `Some(7)`." },
    { code: "7", why: "`_` hodnotu nikam neukládá a větev vypisuje pevný text." },
  ],
  ex: "Vzory jdou vnořit. `Some(1)` sedí na konkrétní hodnotu, `Some(_)` na jakékoli `Some`. Provede se první větev, která sedí." },
{ l: 4, kind: 'Syntaxe',
  q: "Co dělá `=` v zápisu `if let Some(p) = task.priority`?",
  opts: [
    { t: "Odděluje vzor vlevo od hodnoty vpravo", ok: true },
    { t: "Přiřazuje hodnotu do `task.priority`", why: "`task.priority` se tady jen čte, nic se do něj nezapisuje." },
    { t: "Porovnává obě strany jako `==`", why: "Porovnání se píše `==`. Tady se zkouší, jestli hodnota sedí na vzor." },
    { t: "Nastaví `task.priority` na `Some(p)`", why: "`p` je nová proměnná, do které se obsah `Some` vloží." },
  ],
  ex: "Čti: „pokud `task.priority` odpovídá vzoru `Some(p)`, tak…“. Je to zkrácený `match` pro jednu větev." },

// ───────── 05 ─────────
{ l: 5, kind: 'Který zápis?',
  q: "Který z těchto kousků se **nepřeloží**?",
  checks: [
    { src: 'fn main() { let s = String::from("a"); let t = s; println!("{s} {t}"); }', err: 'E0382' },
    { src: 'fn main() { let x = 5; let y = x; println!("{x} {y}"); }', out: "5 5\n" },
    { src: 'fn main() { let s = String::from("a"); let t = s.clone(); println!("{s} {t}"); }', out: "a a\n" },
    { src: 'fn main() { let b = true; let c = b; println!("{b} {c}"); }', out: "true true\n" },
  ],
  opts: [
    { code: 'let s = String::from("a");\nlet t = s;\nprintln!("{s} {t}");', ok: true },
    { code: 'let x = 5;\nlet y = x;\nprintln!("{x} {y}");', why: "`i32` je `Copy`, takže se zkopíruje a `x` platí dál." },
    { code: 'let s = String::from("a");\nlet t = s.clone();\nprintln!("{s} {t}");', why: "`clone()` vyrobí nezávislou kopii, takže `s` platí dál." },
    { code: 'let b = true;\nlet c = b;\nprintln!("{b} {c}");', why: "`bool` je `Copy`, stejně jako čísla a `char`." },
  ],
  ex: "`String` není `Copy`, takže `let t = s;` vlastnictví přesune a použít `s` je chyba `E0382`. Malé typy se místo toho kopírují samy." },
{ l: 5, kind: 'Přeloží se?',
  q: "Co udělá borrow checker s tímhle kódem?",
  code: R`fn main() {
    let mut tasks = vec![String::from("a")];
    let first = &tasks[0];
    tasks.push(String::from("b"));
    println!("{first}");
}`,
  checks: [{ err: 'E0502' }],
  opts: [
    { t: "Nepřeloží se: `push` chce `&mut`, a `first` se ještě používá", ok: true },
    { t: "Přeloží se a vypíše `a`", why: "`push` může vektor přesunout jinam a `first` by ukazoval do uvolněné paměti." },
    { t: "Přeloží se, ale za běhu spadne na neplatné referenci", why: "Přesně tohle kompilátor vyloučí předem, program vůbec nevznikne." },
    { t: "Nepřeloží se: `tasks` musí být `let mut`", why: "`tasks` je `let mut`. Vadí souběh čtenáře a zapisovatele." },
  ],
  ex: "Platí mnoho `&`, **nebo** jedna `&mut`, nikdy obojí. Čtenář `first` žije do `println!`, proto `E0502`." },
{ l: 5, kind: 'Přeloží se?',
  q: "Oproti předchozímu příkladu se jen prohodily řádky. A teď?",
  code: R`fn main() {
    let mut tasks = vec![String::from("a")];
    let first = &tasks[0];
    println!("{first}");
    tasks.push(String::from("b"));
}`,
  checks: [{ out: "a\n" }],
  opts: [
    { t: "Přeloží se a vypíše `a`: výpůjčka končí posledním použitím", ok: true },
    { t: "Nepřeloží se: výpůjčka trvá až do konce bloku", why: "Výpůjčka trvá jen do posledního použití reference, ne do `}`." },
    { t: "Nepřeloží se: `&` a `&mut` nesmí být v jedné funkci", why: "Vadí jen souběh ve stejnou chvíli, a tady se nepřekrývají." },
    { t: "Přeloží se a vypíše `b`: `first` ukazuje na poslední prvek", why: "`&tasks[0]` je první prvek a výpis proběhne ještě před `push`." },
  ],
  ex: "`first` se naposledy použije v `println!`. Tím výpůjčka skončí a `push` je už zapisovatel sám." },
{ l: 5, kind: 'Který zápis?',
  q: "Funkce přidává nový úkol přes `tasks.push(...)` a volající chce seznam používat dál. Jaký parametr potřebuje?",
  checks: [
    { src: 'fn add(tasks: &mut Vec<String>) { tasks.push(String::new()); }\nfn main() { let mut t = Vec::new(); add(&mut t); println!("{}", t.len()); }', out: "1\n" },
    { src: 'fn add(tasks: &mut [String]) { tasks.push(String::new()); }\nfn main() {}', err: 'E0599' },
    { src: 'fn add(tasks: &[String]) { tasks.push(String::new()); }\nfn main() {}', err: 'E0599' },
  ],
  opts: [
    { t: "`tasks: &mut Vec<Task>`", ok: true },
    { t: "`tasks: &mut [Task]`", why: "Slice umí měnit existující prvky, ale délku ne, takže `push` nemá." },
    { t: "`tasks: &[Task]`", why: "To je půjčka jen ke čtení a slice navíc `push` nemá." },
    { t: "`tasks: Vec<Task>`", why: "Funkce by si seznam vzala a volající by ho už neměl." },
  ],
  ex: "Jen čtení: `&[T]`. Změna prvků: `&mut [T]`. Změna délky: `&mut Vec<T>`. A `&mut` se píše i při volání: `add_task(&mut tasks, …)`." },
{ l: 5, kind: 'Co vypíše?',
  q: "Co vypíše program s dereferencí `*r`?",
  code: R`fn main() {
    let mut x: u8 = 1;
    let r = &mut x;
    *r += 1;
    println!("{x}");
}`,
  checks: [{ out: "2\n" }],
  opts: [
    { code: "2", ok: true },
    { code: "1", why: "`r` není kopie, ukazuje přímo na `x`, takže se změní `x`." },
    { t: "Nepřeloží se: `x` je pořád půjčené přes `r`", why: "`r` se naposledy použije na řádku `*r += 1`, tam výpůjčka končí." },
    { t: "Nepřeloží se: `*` je násobení a chybí mu číslo", why: "Před referencí znamená `*` dereferenci: „hodnota, na kterou `r` ukazuje“." },
  ],
  ex: "`&mut x` je měnitelná reference, `*r` je hodnota, na kterou ukazuje. Výpůjčka končí posledním použitím `r`, takže `x` jde pak přečíst." },
{ l: 5, kind: 'Přeloží se?',
  q: "Metoda bere `self` bez `&`. Co se stane na posledním řádku `main`?",
  code: R`struct Task {
    title: String,
}

impl Task {
    fn into_title(self) -> String {
        self.title
    }
}

fn main() {
    let task = Task { title: String::from("Test") };
    let title = task.into_title();
    println!("{title} {}", task.title);
}`,
  checks: [{ err: 'E0382' }],
  opts: [
    { t: "Nepřeloží se: `task` se přesunul do metody", ok: true },
    { t: "Přeloží se a vypíše `Test Test`", why: "To by platilo pro `&self`. `self` hodnotu přesouvá do metody." },
    { t: "Přeloží se a vypíše `Test` a prázdný text", why: "Rust nenechá použít přesunutou hodnotu, ani prázdnou." },
    { t: "Nepřeloží se: metoda nesmí vracet `String`", why: "Vracet `String` je v pořádku, vadí použití `task` po přesunu." },
  ],
  ex: "Podle konvence `into_…` spotřebuje originál, `to_…` vyrobí kopii a `as_…` dá levný pohled. Chyba je `E0382`." },
{ l: 5, kind: 'Přeloží se?',
  q: "Volání na prvku z vektoru. Proč tohle neprojde?",
  code: R`struct Task {
    title: String,
}

impl Task {
    fn into_title(self) -> String {
        self.title
    }
}

fn main() {
    let tasks = vec![Task { title: String::from("Test") }];
    let title = tasks[0].into_title();
    println!("{title}");
}`,
  checks: [{ err: 'E0507' }],
  opts: [
    { t: "`tasks[0]` pořád patří vektoru, nejde ho odnést pryč", ok: true },
    { t: "Vektor `tasks` není `let mut`", why: "`mut` by nepomohlo, zůstala by stejná chyba `E0507`." },
    { t: "Vektor je prázdný, takže `tasks[0]` neexistuje", why: "Vektor má jeden prvek. A index mimo rozsah by byla panika za běhu, ne překlad." },
    { t: "Metody nejde volat přes index `[ ]`", why: "Jde: `tasks[1].complete()` používáme od lekce 03. Vadí až `self` bez `&`." },
  ],
  ex: "Půjčenou věc nejde dát pryč, chyba `E0507`: *cannot move out of index*. Vlastněný prvek dostaneš třeba přes `tasks.remove(0)`." },

// ───────── 06 ─────────
{ l: 6, kind: 'Co vypíše?',
  q: "Napíšeš `quit` a stiskneš Enter. Co vypíše tenhle kód?",
  code: R`use std::io;

fn main() {
    let mut buff = String::new();
    io::stdin().read_line(&mut buff).expect("Can't read");
    println!("{:?}", buff);
}`,
  checks: [{ stdin: "quit\n", out: R`"quit\n"` + "\n" }],
  opts: [
    { code: R`"quit\n"`, ok: true },
    { code: R`"quit"`, why: "`read_line` Enter neodstraní. Na to je až `.trim()`." },
    { code: R`"\nquit"`, why: "Enter je až na konci, po textu." },
    { code: R`quit`, why: "`{:?}` je ladicí výpis, ten text ukáže v uvozovkách a se `\\n`." },
  ],
  ex: "V textu zůstane `\\n` z Enteru, proto `let input = buff.trim();`. `read_line` navíc text **připisuje**, takže `String` vytváříme uvnitř smyčky." },
{ l: 6, kind: 'Co vypíše?',
  q: "Co vrátí `read_line` po prázdném Enteru a co po Ctrl+D?",
  checks: [
    { src: 'use std::io;\nfn main() { let mut b = String::new(); let n = io::stdin().read_line(&mut b).expect("x"); println!("{n}"); }', stdin: "\n", out: "1\n" },
    { src: 'use std::io;\nfn main() { let mut b = String::new(); let n = io::stdin().read_line(&mut b).expect("x"); println!("{n}"); }', stdin: "", out: "0\n" },
  ],
  opts: [
    { t: "Enter vrátí `1`, Ctrl+D vrátí `0`", ok: true },
    { t: "Enter vrátí `0`, Ctrl+D vrátí `1`", why: "Prázdný Enter přece přečte znak `\\n`, a to je jeden bajt." },
    { t: "Oba vrátí `0`", why: "Pak by prázdný Enter vypadal jako konec vstupu a program by skončil." },
    { t: "Enter vrátí `1`, Ctrl+D shodí program", why: "Ctrl+D není chyba, jen konec vstupu. Bez kontroly se smyčka zacyklí." },
  ],
  ex: "`read_line` vrací počet přečtených bajtů. Proto `if bytes == 0 { break; }` pozná konec vstupu a prázdný Enter program neukončí." },
{ l: 6, kind: 'Co vypíše?',
  q: "V textu `list` není žádná mezera. Co se vypíše?",
  code: R`fn main() {
    let input = "list";
    let (cmd, arg) = input.split_once(' ').unwrap_or((input, ""));
    println!("[{cmd}] [{arg}]");
}`,
  checks: [{ out: "[list] []\n" }],
  opts: [
    { code: "[list] []", ok: true },
    { code: "[] [list]", why: "Náhradní dvojice je `(input, \"\")`, celý vstup je tedy první." },
    { code: "[list] [list]", why: "Druhá hodnota v náhradní dvojici je prázdný text `\"\"`." },
    { t: "Program spadne, protože `split_once` vrátí `None`", why: "`None` tu zachytí `unwrap_or` a dosadí náhradní dvojici." },
  ],
  ex: "`split_once` vrací `Option`, protože mezera tam být nemusí. `unwrap_or(x)` vrátí obsah `Some`, nebo při `None` náhradní `x`." },
{ l: 6, kind: 'Co vypíše?',
  q: "Pozor na pořadí větví. Co vypíše tenhle kód?",
  code: R`fn main() {
    match "0".parse::<usize>() {
        Ok(n) => println!("number {n}"),
        Ok(0) => println!("zero"),
        Err(_) => println!("error"),
    }
}`,
  checks: [{ out: "number 0\n", warn: "unreachable pattern" }],
  opts: [
    { code: "number 0", ok: true },
    { code: "zero", why: "Provede se **první** větev, která sedí, a `Ok(n)` sedí na každé `Ok`." },
    { code: "error", why: "`\"0\"` je platné číslo, takže `parse` vrátí `Ok(0)`." },
    { t: "Nepřeloží se: dvě větve se překrývají", why: "Přeloží se. Kompilátor jen varuje: *unreachable pattern*." },
  ],
  ex: "Konkrétní vzor patří **před** obecný. Proto bylo v lekci nejdřív `Ok(0)` a pak `Ok(n)`." },
{ l: 6, kind: 'Co vypíše?',
  q: "Co udělá odčítání u typu `usize`?",
  code: R`fn main() {
    let n = "0".parse::<usize>().expect("Not a number");
    println!("{}", n - 1);
}`,
  checks: [{ panic: "attempt to subtract with overflow" }],
  opts: [
    { t: "V debug buildu spadne: *subtract with overflow*", ok: true },
    { t: "Vypíše `-1`", why: "`usize` záporná čísla nemá." },
    { t: "Vypíše `0`, protože odečítání se zastaví na nule", why: "Rust nic takového sám nedělá, v debug režimu panikaří." },
    { t: "Nepřeloží se: od `usize` nejde odčítat", why: "Odčítat jde, problém vznikne až při výsledku pod nulou." },
  ],
  ex: "Proto `parse_index` odmítá nulu a `n - 1` se počítá až potom. Index zadaný uživatelem od 1 nesmí spadnout na `0 - 1`." },
{ l: 6, kind: 'Syntaxe',
  q: "Co říká `::<usize>` v zápisu `arg.parse::<usize>()`?",
  opts: [
    { t: "Na jaký typ má `parse` text převést", ok: true },
    { t: "Z jakého modulu se má `parse` načíst", why: "`::` tu nevede do modulu, `::<…>` je samostatný zápis pro typ." },
    { t: "Že výsledek je vždy `usize`, chyba nemůže nastat", why: "`parse` pořád vrací `Result`, text číslo být nemusí." },
    { t: "Kolik číslic smí text nejvýš mít", why: "`usize` je typ, ne počet číslic." },
  ],
  ex: "`::<>` je **turbofish** („rybka“). `parse` umí spoustu typů a sám neví, který chceš. Výsledek je `Result<usize, ParseIntError>`." },
{ l: 6, kind: 'Pojem',
  q: "V let chains `if let Some(n) = f(arg) && let Some(t) = tasks.get_mut(n - 1)` první část selže. Co se stane?",
  opts: [
    { t: "Druhá část se nespočítá a provede se `else`", ok: true },
    { t: "Spočítá se i druhá část a až pak se rozhodne", why: "Vyhodnocuje se zleva a líně. Navíc by chybělo `n`." },
    { t: "Program spadne, protože `n` neexistuje", why: "Když první část selže, na `n - 1` se vůbec nedojde." },
    { t: "Provede se tělo `if` s výchozím `n = 0`", why: "Rust výchozí hodnoty nedoplňuje. Tělo běží, jen když sedí všechny části." },
  ],
  ex: "Řetězení je novinka edice 2024. `else` se provede, když selže **kterákoli** část, proto nejde poznat, která. To řeší až lekce 07." },

// ───────── 07 ─────────
{ l: 7, kind: 'Pojem',
  q: "Co udělá `let n = parse_index(arg)?;`, když `parse_index` vrátí `Err`?",
  opts: [
    { t: "Hned ukončí aktuální funkci a chybu vrátí volajícímu", ok: true },
    { t: "Shodí program se zprávou, stejně jako `.expect()`", why: "`?` nepadá, jen chybu předá o patro výš." },
    { t: "Vypíše chybu a pokračuje s `n = 0`", why: "`?` sám nic nevypisuje a výchozí hodnotu nedosazuje." },
    { t: "Uloží do `n` hodnotu `None` a jede dál", why: "`n` je čisté `usize` a do řádku se při chybě vůbec nedojde." },
  ],
  ex: "`výraz?` je zkratka za `match`: `Ok(v)` → `v`, `Err(e)` → `return Err(e)`." },
{ l: 7, kind: 'Přeloží se?',
  q: "Otazník přímo v `main`. Co se stane?",
  code: R`fn main() {
    let n = "abc".parse::<usize>()?;
    println!("{n}");
}`,
  checks: [{ err: 'E0277' }],
  opts: [
    { t: "Nepřeloží se: `main` nevrací `Result`", ok: true },
    { t: "Přeloží se a za běhu vypíše chybu", why: "Otazník chybu nevypisuje, jen ji vrací. A `main` tu nevrací nic." },
    { t: "Přeloží se a `n` bude `0`", why: "`?` žádnou výchozí hodnotu nedosazuje." },
    { t: "Nepřeloží se: `?` jde jen na `Option`", why: "Naopak, tady stojí na `Result`, a to je v pořádku. Vadí funkce kolem." },
  ],
  ex: "`?` jde jen ve funkci, která sama vrací `Result`. Jinde chybu vyřešíš přes `match`, jako v našem `main`. Chyba je `E0277`." },
{ l: 7, kind: 'Přeloží se?',
  q: "Uprostřed funkce chybí jedno slovo. Co se stane?",
  code: R`fn check(n: usize) -> Result<usize, String> {
    if n == 0 {
        Err(String::from("zero"));
    }
    Ok(n)
}

fn main() {
    println!("{:?}", check(0));
}`,
  checks: [{ err: 'E0282' }],
  opts: [
    { t: "Nepřeloží se: `Err(…);` chybí `return`", ok: true },
    { t: "Přeloží se a vypíše `Err(\"zero\")`", why: "Výraz bez `return` je návratová hodnota jen na **konci** funkce." },
    { t: "Přeloží se a vypíše `Ok(0)`", why: "Tak by to mohlo vypadat, ale kompilátor neví, jaký `T` má osamělý `Err`." },
    { t: "Nepřeloží se: v `if` nesmí být `Err`", why: "`Err` v `if` být může, jen s `return` před ním: `return Err(…);`." },
  ],
  ex: "Uprostřed funkce je potřeba `return Err(…);`. Hláška je matoucí: `E0282` *type annotations needed*." },
{ l: 7, kind: 'Který zápis?',
  q: "Máme `opt: Option<&Task>` a funkce vrací `Result<&Task, TaskError>`. Který řádek se přeloží?",
  checks: [
    { src: 'struct Task;\n#[derive(Debug)] enum TaskError { NoSuchTask(usize) }\nfn f(opt: Option<&Task>, n: usize) -> Result<&Task, TaskError> { opt.ok_or(TaskError::NoSuchTask(n)) }\nfn main() { println!("{:?}", f(None, 9).is_err()); }', out: "true\n" },
    { src: 'struct Task;\n#[derive(Debug)] enum TaskError { NoSuchTask(usize) }\nfn f(opt: Option<&Task>, n: usize) -> Result<&Task, TaskError> { opt.ok_or(|| TaskError::NoSuchTask(n)) }\nfn main() {}', err: 'E0308' },
    { src: 'struct Task;\n#[derive(Debug)] enum TaskError { NoSuchTask(usize) }\nfn f(opt: Option<&Task>, n: usize) -> Result<&Task, TaskError> { opt.ok_or_else(TaskError::NoSuchTask(n)) }\nfn main() {}', err: 'E0277' },
    { src: 'struct Task;\n#[derive(Debug)] enum TaskError { NoSuchTask(usize) }\nfn f(opt: Option<&Task>, _n: usize) -> Result<&Task, TaskError> { let t = opt?; Ok(t) }\nfn main() {}', err: 'E0277' },
  ],
  opts: [
    { code: "opt.ok_or(TaskError::NoSuchTask(n))", ok: true },
    { code: "opt.ok_or(|| TaskError::NoSuchTask(n))", why: "`ok_or` chce hotovou hodnotu, ne closure (`E0308`)." },
    { code: "opt.ok_or_else(TaskError::NoSuchTask(n))", why: "`ok_or_else` chce closure, tedy `|| …`, ne hotovou hodnotu." },
    { code: "let t = opt?; Ok(t)", why: "`?` na `Option` ve funkci s `Result` nejde. Nejdřív `ok_or`." },
  ],
  ex: "`ok_or(hodnota)` má chybu rovnou hotovou. `ok_or_else(|| …)` ji vyrobí až při `None`, což se hodí, když je výroba drahá (`format!`)." },
{ l: 7, kind: 'Co vypíše?',
  q: "Co udělá `map_err` s hodnotou `Ok`?",
  code: R`fn main() {
    let result: Result<i32, String> = Ok(5);
    println!("{:?}", result.map_err(|_| 0));
}`,
  checks: [{ out: "Ok(5)\n" }],
  opts: [
    { code: "Ok(5)", ok: true },
    { code: "Ok(0)", why: "Closure se při `Ok` vůbec nezavolá." },
    { code: "Err(0)", why: "`map_err` z úspěchu chybu neudělá, jen přepisuje existující `Err`." },
    { code: "Err(5)", why: "`Ok` zůstává `Ok` a hodnota se nemění." },
  ],
  ex: "`map_err` přepíše jen `Err`, typicky aby seděl typ chyby pro `?`. `|_|` = closure s jedním parametrem, který zahazujeme." },
{ l: 7, kind: 'Co vypíše?',
  q: "Jedna chyba, dva formáty. Co se vypíše?",
  code: R`use std::fmt;

#[derive(Debug)]
enum TaskError {
    NoSuchTask(usize),
}

impl fmt::Display for TaskError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            TaskError::NoSuchTask(index) => write!(f, "No task {}", index),
        }
    }
}

fn main() {
    let err = TaskError::NoSuchTask(99);
    println!("{}", err);
    println!("{:?}", err);
}`,
  checks: [{ out: "No task 99\nNoSuchTask(99)\n" }],
  opts: [
    { code: "No task 99\nNoSuchTask(99)", ok: true },
    { code: "NoSuchTask(99)\nNo task 99", why: "`{}` používá náš `Display`, `{:?}` odvozený `Debug`." },
    { code: "No task 99\nNo task 99", why: "`{:?}` náš `Display` nepoužije, má vlastní výpis z `derive(Debug)`." },
    { code: "NoSuchTask(99)\nNoSuchTask(99)", why: "`{}` by bez `impl Display` vůbec nešlo, a to máme napsané." },
  ],
  ex: "`{}` = `Display`, výpis pro uživatele. `{:?}` = `Debug`, výpis pro programátora." },
{ l: 7, kind: 'ToDo z lekce 07',
  q: "V ToDo programu z lekce 07 napíšeš `start 0`. Co se vypíše?",
  checks: [{ tag: 'lekce-07', stdin: "start 0\nquit\n", out: "> Error: Task numbers start at 1\n> " }],
  opts: [
    { code: "Error: Task numbers start at 1", ok: true },
    { code: "Error: No task 0", why: "K `get_mut` se nedojde, `parse_index` nulu odmítne dřív." },
    { code: "Error: Not a number: 0", why: "`0` je platné číslo, takže `parse` se povede." },
    { t: "Panika *subtract with overflow*", why: "Ta hrozí v `n - 1`, ale `?` vrátí chybu ještě před tímto řádkem." },
  ],
  ex: "Cesta chyby: `parse_index` vrátí `Err(ZeroIndex)` → `?` v `get_task` → `match` v `main` → `Display` → `Error: …`." },
{ l: 7, kind: 'ToDo z lekce 07',
  q: "A když napíšeš `done  2` se **dvěma** mezerami?",
  checks: [{ tag: 'lekce-07', stdin: "done  2\nquit\n", out: "> Error: Not a number:  2\n> " }],
  opts: [
    { code: "Error: Not a number:  2", ok: true },
    { t: "Úkol 2 se označí jako hotový a nic se nevypíše", why: "To by platilo, kdyby se `arg` ořezával přes `arg.trim()`." },
    { code: "Error: Missing argument", why: "`arg` není prázdný, je v něm `\" 2\"`." },
    { code: "Unknown command: done, try: help", why: "`cmd` je správně `done`, dělí se na první mezeře." },
  ],
  ex: "`split_once(' ')` dělí na **první** mezeře, takže v `arg` zůstane `\" 2\"` a `parse` selže. Stačilo by `arg.trim()`." },
{ l: 7, kind: 'Pojem',
  q: "Uživatel napíše `start abc`. Jak na to má program reagovat?",
  opts: [
    { t: "Vrátit `Err(…)`, vypsat hlášku a čekat na další příkaz", ok: true },
    { t: "Zavolat `.expect(\"…\")`, ať program spadne se zprávou", why: "`expect` je na chyby, které by neměly nastat, ne na překlep uživatele." },
    { t: "Chybu zahodit a pokračovat, jako by se nic nestalo", why: "Uživatel by se nedozvěděl, co je špatně." },
    { t: "Použít `tasks[n]` a nechat program panikařit", why: "Číslo od uživatele nikdy neindexuj přes `[ ]`." },
  ],
  ex: "Chyba uživatele = `Result` a hláška. Chyba, která by neměla nastat (nejde psát na terminál) = `.expect(\"…\")`." },
];
