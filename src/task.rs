#[derive(Debug, Clone)]
enum TaskStatus {
    ToDo,
    InProgress,
    Done,
    Canceled,
}

#[derive(Debug, Clone)]
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
