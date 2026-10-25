#[derive(Debug, Clone)]
enum TaskStatus {
    ToDo,
    InProgress,
    Done,
    Canceled,
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
}

fn add_task(tasks: &mut Vec<Task>, title: &str) {
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

fn main() {
    let mut tasks: Vec<Task> = vec![
        Task::new("Buy groceries"),
        Task::new("Clean the house"),
        Task::new("Finish Rust project"),
    ];

    tasks[0].cancel();
    tasks[1].rename("Clean the entire house");
    tasks[1].complete();
    tasks[2].set_priority(1);
    tasks[2].start();

    start_all(&mut tasks);

    add_task(&mut tasks, "New task");

    //dbg!(&tasks);
    print_tasks(&tasks);

    let found_task = find_task(&tasks, "New task");
    if let Some(task) = found_task {
        dbg!(task);
    };

    match tasks.get(10) {
        Some(task) => println!("Task found: {}", task.title),
        None => println!("Task not found"),
    };
}
