import { useState } from 'react';
import { Plus, Lightbulb } from 'lucide-react';
import { parseNaturalLanguageTask } from '../utils/taskParser';
import { ParsedTask } from '../types/Task';

interface TaskInputProps {
  onAddTask: (task: ParsedTask) => void;
}

export function TaskInput({ onAddTask }: TaskInputProps) {
  const [input, setInput] = useState('');
  const [preview, setPreview] = useState<ParsedTask | null>(null);

  const handleInputChange = (value: string) => {
    setInput(value);
    if (value.trim()) {
      const parsed = parseNaturalLanguageTask(value);
      setPreview(parsed);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      const parsed = parseNaturalLanguageTask(input);
      onAddTask(parsed);
      setInput('');
      setPreview(null);
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P1': return 'text-red-600 bg-red-50 border-red-200';
      case 'P2': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'P3': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'P4': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
          <Plus className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Add New Task</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Type your task in natural language..."
            className="w-full p-4 text-lg border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 resize-none h-32"
            rows={3}
          />
          {input && (
            <button
              type="submit"
              className="absolute bottom-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
            >
              Add Task
            </button>
          )}
        </div>

        {preview && (
          <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-800">Preview</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Task</label>
                <div className="p-3 bg-white rounded-lg border">
                  <p className="font-medium text-gray-800">{preview.taskName || 'Untitled task'}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Assignee</label>
                <div className="p-3 bg-white rounded-lg border">
                  <p className="text-gray-800">{preview.assignee || 'Unassigned'}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Due Date</label>
                <div className="p-3 bg-white rounded-lg border">
                  <p className="text-gray-800">{formatDate(preview.dueDate)}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Priority</label>
                <div className={`p-3 rounded-lg border ${getPriorityColor(preview.priority)}`}>
                  <p className="font-medium">{preview.priority}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}