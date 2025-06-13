import { useState } from 'react';
import { Calendar, User, Flag, Clock, Edit2, Save, X, Trash2 } from 'lucide-react';
import { Task } from '../types/Task';

interface TaskCardProps {
  task: Task;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
}

export function TaskCard({ task, onUpdateTask, onDeleteTask }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    taskName: task.taskName,
    assignee: task.assignee,
    priority: task.priority,
    dueDate: task.dueDate ? task.dueDate.toISOString().slice(0, 16) : '',
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P1': return 'bg-red-100 text-red-800 border-red-300';
      case 'P2': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'P3': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'P4': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getPriorityIcon = (priority: string) => {
    const iconProps = { className: 'w-4 h-4' };
    switch (priority) {
      case 'P1': return <Flag {...iconProps} className="w-4 h-4 text-red-600" />;
      case 'P2': return <Flag {...iconProps} className="w-4 h-4 text-orange-600" />;
      case 'P3': return <Flag {...iconProps} className="w-4 h-4 text-blue-600" />;
      case 'P4': return <Flag {...iconProps} className="w-4 h-4 text-gray-600" />;
      default: return <Flag {...iconProps} className="w-4 h-4 text-blue-600" />;
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'No due date';
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const isOverdue = (date: Date | null) => {
    if (!date) return false;
    return date < new Date() && !task.completed;
  };

  const handleSave = () => {
    onUpdateTask(task.id, {
      taskName: editValues.taskName,
      assignee: editValues.assignee,
      priority: editValues.priority as 'P1' | 'P2' | 'P3' | 'P4',
      dueDate: editValues.dueDate ? new Date(editValues.dueDate) : null,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValues({
      taskName: task.taskName,
      assignee: task.assignee,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.toISOString().slice(0, 16) : '',
    });
    setIsEditing(false);
  };

  const toggleComplete = () => {
    onUpdateTask(task.id, { completed: !task.completed });
  };

  return (
    <div className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border-l-4 ${
      task.completed 
        ? 'border-green-400 opacity-75' 
        : isOverdue(task.dueDate) 
          ? 'border-red-400' 
          : 'border-purple-400'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={toggleComplete}
            className="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
          />
          {isEditing ? (
            <input
              type="text"
              value={editValues.taskName}
              onChange={(e) => setEditValues({ ...editValues, taskName: e.target.value })}
              className="text-lg font-semibold text-gray-800 bg-gray-50 border border-gray-300 rounded px-3 py-1 flex-1"
              autoFocus
            />
          ) : (
            <h3 className={`text-lg font-semibold ${
              task.completed ? 'text-gray-500 line-through' : 'text-gray-800'
            }`}>
              {task.taskName}
            </h3>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={handleCancel}
                className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDeleteTask(task.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <User className="w-4 h-4 text-gray-500" />
          {isEditing ? (
            <input
              type="text"
              value={editValues.assignee}
              onChange={(e) => setEditValues({ ...editValues, assignee: e.target.value })}
              placeholder="Assignee"
              className="text-sm text-gray-700 bg-gray-50 border border-gray-300 rounded px-2 py-1 flex-1"
            />
          ) : (
            <span className="text-sm text-gray-700">
              {task.assignee || 'Unassigned'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Calendar className={`w-4 h-4 ${isOverdue(task.dueDate) ? 'text-red-500' : 'text-gray-500'}`} />
          {isEditing ? (
            <input
              type="datetime-local"
              value={editValues.dueDate}
              onChange={(e) => setEditValues({ ...editValues, dueDate: e.target.value })}
              className="text-sm text-gray-700 bg-gray-50 border border-gray-300 rounded px-2 py-1 flex-1"
            />
          ) : (
            <span className={`text-sm ${
              isOverdue(task.dueDate) ? 'text-red-600 font-medium' : 'text-gray-700'
            }`}>
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getPriorityIcon(task.priority)}
            {isEditing ? (
              <select
                value={editValues.priority}
                onChange={(e) => setEditValues({ ...editValues, priority: e.target.value as 'P1' | 'P2' | 'P3' | 'P4' })}
                className="text-sm bg-gray-50 border border-gray-300 rounded px-2 py-1"
              >
                <option value="P1">P1 - Critical</option>
                <option value="P2">P2 - High</option>
                <option value="P3">P3 - Medium</option>
                <option value="P4">P4 - Low</option>
              </select>
            ) : (
              <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
            )}
          </div>
          
          {isOverdue(task.dueDate) && !task.completed && (
            <div className="flex items-center gap-1 px-2 py-1 bg-red-50 rounded-full">
              <Clock className="w-3 h-3 text-red-600" />
              <span className="text-xs text-red-600 font-medium">Overdue</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500 italic">
          Original: "{task.originalInput}"
        </p>
      </div>
    </div>
  );
}