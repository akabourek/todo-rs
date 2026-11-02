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
            "list" => list::print_tasks(&tasks),
            "add" => list::add_task(&mut tasks, arg.trim()),
            "startall" => list::start_all(&mut tasks),
            "start" => match list::get_task(&mut tasks, arg) {
                Ok(task) => task.start(),
                Err(err) => println!("Error: {}", err),
            },
            "done" => match list::get_task(&mut tasks, arg) {
                Ok(task) => task.complete(),
                Err(err) => println!("Error: {}", err),
            },
            "cancel" => match list::get_task(&mut tasks, arg) {
                Ok(task) => task.cancel(),
                Err(err) => println!("Error: {}", err),
            },
            "help" => {
                println!("quit: end of app");
                println!("list: print all tasks");
                println!("add <title>: add new task");
                println!("startall: start all unfinished tasks");
                println!("start <n>: start task number <n>");
                println!("done <n>: finish task number <n>");
                println!("cancel <n>: cancel task number <n>");
            }
            _ => println!("Unknown command: {}, try: help", cmd),
        }
    }
}
