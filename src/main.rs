use std::fmt;
use std::io;
use std::io::Write;

#[derive(Debug, Clone)]
enum TaskStatus {
    ToDo,
    InProgress,
    Done,
    Canceled,
}

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

#[derive(Debug, Clone)]
struct Task {
    title: String,
    status: TaskStatus,
    priority: Option<u8>,
}

impl Task {
    fn new(title: &str) -> Self {
        Self {
            title: title.to_string(),
            status: TaskStatus::ToDo,
            priority: None,
        }
    }

    fn rename(&mut self, new_title: &str) {
        self.title = new_title.to_string();
    }

    fn set_priority(&mut self, priority: u8) {
        self.priority = Some(priority);
    }

    fn priority_label(&self) -> &str {
        match self.priority {
            Some(1) => "High",
            Some(2) => "Medium",
            Some(3) => "Low",
            _ => "None",
        }
    }

    fn cancel(&mut self) {
        self.status = TaskStatus::Canceled;
    }

    fn start(&mut self) {
        self.status = TaskStatus::InProgress;
    }

    fn complete(&mut self) {
        self.status = TaskStatus::Done;
    }

    fn symbol(&self) -> char {
        match self.status {
            TaskStatus::ToDo => ' ',
            TaskStatus::InProgress => '~',
            TaskStatus::Done => 'X',
            TaskStatus::Canceled => 'C',
        }
    }

    fn is_done(&self) -> bool {
        matches!(self.status, TaskStatus::Done)
    }
}

fn print_tasks(tasks: &[Task]) {
    let count_done = tasks.iter().filter(|task| task.is_done()).count();
    tasks.iter().enumerate().for_each(|(index, task)| {
        println!("{}: [{}] {}", index + 1, task.symbol(), task.title);
        println!("   Priority: {}", task.priority_label());
    });
    println!("Done: {}/{}", count_done, tasks.len());
}

fn add_task(tasks: &mut Vec<Task>, title: &str) {
    if title.is_empty() {
        println!("Title can't be empty!");
        return;
    }
    tasks.push(Task::new(title));
}

fn start_all(tasks: &mut [Task]) {
    tasks
        .iter_mut()
        .filter(|task| matches!(task.status, TaskStatus::ToDo))
        .for_each(|task| task.start());
}

fn find_task<'a>(tasks: &'a [Task], title: &str) -> Option<&'a Task> {
    tasks.iter().find(|task| task.title == title)
}

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
            "list" => print_tasks(&tasks),
            "add" => add_task(&mut tasks, arg.trim()),
            "startall" => start_all(&mut tasks),
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
