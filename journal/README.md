# Journal – Rust od nuly přes ToDo list

Každá lekce = jeden krok aplikace + jeden okruh Rustu. Kód ke každé lekci je v gitu pod tagem `lekce-NN`:

```bash
git tag                    # seznam lekcí
git checkout lekce-01      # stav kódu po lekci 01
git checkout main          # zpět na aktuální stav
git diff lekce-01 lekce-02 # co přibylo mezi lekcemi
```

## Obsah

### Část I – Základy (konzole)
- [00 – Příprava prostředí](00-priprava.md)
- [01 – První program](01-prvni-program.md) – proměnné, `Vec`, `for`, makra, closure `|x|`
- [02 – Debugování ve VS Code](02-debugovani.md) – CodeLLDB, breakpointy, krokování, `dbg!`
- [03 – Struktury a metody](03-struktury-a-metody.md) – `struct`, `impl`, `&self`, `String` vs `&str`, `if` jako výraz
- [04 – Enumy a `match`](04-enumy-a-match.md) – `enum`, `match`, `matches!`, `Option`, `if let`, `get` vs `[]`
- [05 – Vlastnictví a výpůjčky](05-vlastnictvi-a-vypujcky.md) – move, `Copy`/`clone`, `&`/`&mut`, borrow checker, slice `&[T]`
  - [Infografika: Kdo drží krabici?](05-vlastnictvi-infografika.html) – vlastnictví na krabicích + hřiště na borrow checker (otevřít v prohlížeči)

Celá plánovaná osnova je v [CLAUDE.md](../CLAUDE.md#osnova-stav--hotovo--čeká).
