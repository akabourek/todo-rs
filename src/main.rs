#[derive(Debug)]
enum TaskStatus {
    ToDo,
    InProgress,
    Done,
    Canceled,
}

#[derive(Debug)]
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

fn main() {
    let mut tasks: Vec<Task> = vec![
        Task::new("Buy groceries"),
        Task::new("Clean the house"),
        Task::new("Finish Rust project"),
    ];

    tasks[1].rename("Clean the entire house");
    tasks[1].complete();
    tasks[2].set_priority(1);
    tasks[2].start();

    //dbg!(&tasks);

    let count_done = tasks.iter().filter(|task| task.is_done()).count();

    tasks.iter().enumerate().for_each(|(index, task)| {
        println!("{}: [{}] {}", index + 1, task.symbol(), task.title);
        // if let Some(priority) = task.priority {
        //     println!("   Priority: {}", priority);
        // }
        // match task.priority {
        //     Some(priority) => println!("   Priority: {}", priority),
        //     None => println!("   No priority set"),
        // };
        println!("   Priority: {}", task.priority_label());
    });

    println!("Done: {}/{}", count_done, tasks.len());

    match tasks.get(10) {
        Some(task) => println!("Task found: {}", task.title),
        None => println!("Task not found"),
    };
}
