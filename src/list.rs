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

#[cfg(test)]
mod tests {
    use super::*;

    fn sample_tasks() -> Vec<Task> {
        vec![Task::new("A"), Task::new("B")]
    }

    #[test]
    fn parse_index_number() {
        assert_eq!(parse_index("3"), Ok(3));
    }

    #[test]
    fn parse_index_rejects_zero() {
        assert_eq!(parse_index("0"), Err(TaskError::ZeroIndex));
    }

    #[test]
    fn parse_index_rejects_empty() {
        assert_eq!(parse_index(""), Err(TaskError::MissingArgument));
    }

    #[test]
    fn parse_index_not_a_number() {
        assert_eq!(
            parse_index("abc"),
            Err(TaskError::NotANumber("abc".to_string()))
        );
    }

    #[test]
    fn get_task_returns_task_by_number() {
        assert_eq!(get_task(&mut sample_tasks(), "2").unwrap().title(), "B");
    }

    #[test]
    fn get_task_out_of_bounds() {
        assert_eq!(
            get_task(&mut sample_tasks(), "3").unwrap_err(),
            TaskError::NoSuchTask(3)
        );
    }

    #[test]
    fn start_all_only_uncompleted_tasks() {
        let mut tasks = sample_tasks();
        tasks[0].complete();
        start_all(&mut tasks);
        assert!(tasks[0].is_done());
        assert_eq!(tasks[1].symbol(), '~');
    }

    #[test]
    fn add_empty_task() {
        let mut tasks = sample_tasks();
        add_task(&mut tasks, "");
        assert_eq!(tasks.len(), 2);
    }

    #[test]
    fn find_task_result() {
        let tasks = sample_tasks();
        assert_eq!(find_task(&tasks, "A").unwrap().title(), "A");
        assert_eq!(find_task(&tasks, "X"), None);
    }
}
