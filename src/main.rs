fn main() {
    let list = ["Apple", "Banana", "Cherry"];

    println!("====== My ToDo List ======");

    // list.iter().enumerate().for_each(|(index, entry)| {
    //     println!("{}: {}", index + 1, entry);
    // });

    for (index, entry) in list.iter().enumerate() {
        println!("{}: {entry}", index + 1);
    }

    println!("Count: {}", list.len());
}
