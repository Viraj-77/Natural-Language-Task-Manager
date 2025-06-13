import { useState } from 'react';
import { Task } from '../types/Task';
import { TaskCard } from './TaskCard';
import { LayoutGrid, List, Filter, Search } from 'lucide-react';

interface TaskBoardProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
}

export function TaskBoard({ tasks, onUpdateTask, onDeleteTask }: TaskBoardProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'overdue'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getFilteredTasks = () => {
    let filtered = tasks;

    if (searchTerm) {
      filtered = filtered.filter(task => 
        task.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.assignee.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    switch (filter) {
      case 'completed':
        return filtered.filter(task => task.completed);
      case 'pending':
        return filtered.filter(task => !task.completed);
      case 'overdue':
        return filtered.filter(task => 
          !task.completed && task.dueDate && task.dueDate < new Date()
        );
      default:
        return filtered;
    }
  };

  const filteredTasks = getFilteredTasks();
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
    overdue: tasks.filter(t => !t.completed && t.dueDate && t.dueDate < new Date()).length
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Task Board</h2>
          <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
              >
                <LayoutGrid className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
              >
                <List className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{taskStats.total}</div>
            <div className="text-sm text-blue-700">Total Tasks</div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{taskStats.completed}</div>
            <div className="text-sm text-green-700">Completed</div>
          </div>
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{taskStats.pending}</div>
            <div className="text-sm text-yellow-700">Pending</div>
          </div>
          <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{taskStats.overdue}</div>
            <div className="text-sm text-red-700">Overdue</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tasks or assignees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No tasks found</h3>
          <p className="text-gray-600">
            {tasks.length === 0 
              ? "Start by adding your first task above!" 
              : "Try adjusting your search or filter criteria."}
          </p>
        </div>
      ) : (
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdateTask={onUpdateTask}
              onDeleteTask={onDeleteTask}
            />
          ))}
        </div>
      )}
    </div>
  );
}