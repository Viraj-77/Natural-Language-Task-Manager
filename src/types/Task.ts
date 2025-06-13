export interface Task {
  id: string;
  taskName: string;
  assignee: string;
  dueDate: Date | null;
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  completed: boolean;
  originalInput: string;
}

export interface ParsedTask {
  taskName: string;
  assignee: string;
  dueDate: Date | null;
  priority: 'P1' | 'P2' | 'P3' | 'P4';
}