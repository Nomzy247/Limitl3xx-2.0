import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, AlertTriangle, Plus, Check } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Review pending withdrawals', completed: false },
    { id: '2', title: 'Update cloud mining pool costs', completed: false },
    { id: '3', title: 'Verify new merchant accounts', completed: true },
  ]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setTasks([...tasks, { id: Date.now().toString(), title: newTaskTitle, completed: false }]);
    setNewTaskTitle('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const confirmDelete = (id: string) => {
    setTaskToDelete(id);
  };

  const executeDelete = () => {
    if (taskToDelete) {
      setTasks(tasks.filter(t => t.id !== taskToDelete));
      setTaskToDelete(null);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-3xl p-6 relative overflow-hidden">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">Admin Tasks</h3>
      
      <form onSubmit={addTask} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="New task here..."
          className="flex-1 bg-background border border-border rounded-xl px-4 py-2 focus:outline-none focus:border-[#0052ff] transition-colors"
        />
        <button type="submit" className="p-2 bg-[#0052ff] hover:bg-[#0052ff]/90 text-white rounded-xl transition-colors">
          <Plus size={20} />
        </button>
      </form>

      <div className="space-y-3">
        {tasks.map(task => (
          <div key={task.id} className="flex justify-between items-center p-3 bg-background rounded-xl border border-border/50">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => toggleTask(task.id)}
                className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-border'}`}
              >
                {task.completed && <Check size={14} />}
              </button>
              <span className={`text-sm ${task.completed ? 'line-through text-secondary' : 'text-primary'}`}>{task.title}</span>
            </div>
            <button 
              onClick={() => confirmDelete(task.id)}
              className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {tasks.length === 0 && <p className="text-secondary text-sm text-center py-4">No tasks pending.</p>}
      </div>

      <AnimatePresence>
        {taskToDelete && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-10"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-surface border border-border rounded-2xl p-6 shadow-xl max-w-sm w-full text-center"
            >
              <AlertTriangle size={48} className="mx-auto text-amber-500 mb-4" />
              <h4 className="text-lg font-bold mb-2">Delete Task</h4>
              <p className="text-secondary text-sm mb-6">Are you sure you want to delete this task?</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setTaskToDelete(null)}
                  className="flex-1 py-2 px-4 bg-background border border-border rounded-xl font-bold hover:bg-subtle transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={executeDelete}
                  className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
