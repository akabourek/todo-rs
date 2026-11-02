use crate::error::TaskError;
use crate::task::Task;

pub fn print_tasks(tasks: &[Task]) {
    let count_done = tasks.iter().filter(|task| task.is_done()).count();
    tasks.iter().enumerate().for_each(|(index, task)| {
        println!("{}: [{}] {}", index + 1, task.symbol(), task.title());
        println!("   Priority: {}", task.priority_label());
    });
    println!("Done: {}/{}", count_done, tasks.len());
}

pub fn add_task(tasks: &mut Vec<Task>, title: &str) {
    if title.is_empty() {
        println!("Title can't be empty!");
        return;
    }
    tasks.push(Task::new(title));
}

pub fn start_all(tasks: &mut [Task]) {
    tasks
        .iter_mut()
        .filter(|task| task.is_todo())
        .for_each(|task| task.start());
}

pub fn find_task<'a>(tasks: &'a [Task], title: &str) -> Option<&'a Task> {
    tasks.iter().find(|task| task.title() == title)
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

pub fn get_task<'a>(tasks: &'a mut [Task], arg: &str) -> Result<&'a mut Task, TaskError> {
    let n = parse_index(arg)?;
    tasks.get_mut(n - 1).ok_or(TaskError::NoSuchTask(n))
}
