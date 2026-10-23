#[derive(Debug)]
struct Task {
    title: String,
    done: bool,
}

impl Task {
    fn new(title: &str) -> Self {
        Self {
            title: title.to_string(),
            done: false,
        }
    }

    fn rename(&mut self, new_title: &str) {
        self.title = new_title.to_string();
    }

    fn complete(&mut self) {
        self.done = true;
    }

    fn is_done(&self) -> bool {
        self.done
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

    //dbg!(&tasks);

    let count_done = tasks.iter().filter(|task| task.done).count();

    tasks.iter().enumerate().for_each(|(index, task)| {
        println!(
            "{}: [{}] {}",
            index + 1,
            if task.is_done() { "X" } else { " " },
            task.title
        );
    });

    println!("Done: {}/{}", count_done, tasks.len());
}
