#[derive(Debug, Clone, PartialEq)]
enum TaskStatus {
    ToDo,
    InProgress,
    Done,
    Canceled,
}

#[derive(Debug, Clone, PartialEq)]
pub struct Task {
    title: String,
    status: TaskStatus,
    priority: Option<u8>,
}

impl Task {
    pub fn new(title: &str) -> Self {
        Self {
            title: title.to_string(),
            status: TaskStatus::ToDo,
            priority: None,
        }
    }

    pub fn title(&self) -> &str {
        &self.title
    }

    pub fn rename(&mut self, new_title: &str) {
        self.title = new_title.to_string();
    }

    pub fn set_priority(&mut self, priority: u8) {
        self.priority = Some(priority);
    }

    pub fn priority_label(&self) -> &str {
        match self.priority {
            Some(1) => "High",
            Some(2) => "Medium",
            Some(3) => "Low",
            _ => "None",
        }
    }

    pub fn cancel(&mut self) {
        self.status = TaskStatus::Canceled;
    }

    pub fn start(&mut self) {
        self.status = TaskStatus::InProgress;
    }

    pub fn complete(&mut self) {
        self.status = TaskStatus::Done;
    }

    pub fn symbol(&self) -> char {
        match self.status {
            TaskStatus::ToDo => ' ',
            TaskStatus::InProgress => '~',
            TaskStatus::Done => 'X',
            TaskStatus::Canceled => 'C',
        }
    }

    pub fn is_done(&self) -> bool {
        matches!(self.status, TaskStatus::Done)
    }

    pub fn is_todo(&self) -> bool {
        matches!(self.status, TaskStatus::ToDo)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn new_task_has_title() {
        assert_eq!(Task::new("A").title, "A");
    }

    #[test]
    fn new_task_is_todo() {
        assert_eq!(Task::new("A").status, TaskStatus::ToDo);
    }

    #[test]
    fn new_task_priority_is_none() {
        assert_eq!(Task::new("A").priority_label(), "None");
    }

    #[test]
    fn task_start() {
        let mut task = Task::new("A");
        task.start();
        assert_eq!(task.status, TaskStatus::InProgress);
    }

    #[test]
    fn task_set_priority_high() {
        let mut task = Task::new("A");
        task.set_priority(1);
        assert_eq!(task.priority_label(), "High");
    }

    #[test]
    fn task_set_priority_out_of_range() {
        let mut task = Task::new("A");
        task.set_priority(9);
        assert_eq!(task.priority_label(), "None");
    }

    #[test]
    fn task_rename() {
        let mut task = Task::new("A");
        task.rename("X");
        assert_eq!(task.title, "X");
    }
}
