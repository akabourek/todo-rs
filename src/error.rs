use std::fmt;

#[derive(Debug, PartialEq)]
pub enum TaskError {
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
