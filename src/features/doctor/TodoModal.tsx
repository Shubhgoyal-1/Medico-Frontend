import React, { useState, useEffect, useRef } from 'react';
import {
  CheckSquare, X, Plus, Trash2, Edit2, Check, AlertCircle, Timer
} from 'lucide-react';
import { toast } from 'sonner';
import { doctorService } from '@/services/doctor.service';

export interface TodoItem {
  _id: string;
  id?: string;
  text: string;
  done: boolean;
  priority?: 'normal' | 'urgent';
  durationMinutes?: number | null;
  createdAt: string;
}

interface TodoDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TodoDropdown({ isOpen, onClose }: TodoDropdownProps) {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [newText, setNewText] = useState('');
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal');
  const [durationMinutes, setDurationMinutes] = useState<string>('0');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editDuration, setEditDuration] = useState<string>('0');
  
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [nowTime, setNowTime] = useState<number>(Date.now());
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const data = await doctorService.getTodos();
      setTodos(data);
    } catch (err) {
      console.error("Failed to fetch doctor todos", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTodos();
    }
  }, [isOpen]);

  useEffect(() => {
    const timer = setInterval(() => {
      setNowTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const timerMins = parseInt(durationMinutes, 10);

    try {
      const data = await doctorService.addTodo({
        text: newText.trim(),
        priority,
        durationMinutes: timerMins > 0 ? timerMins : null,
      });

      setTodos(data);
      toast.success('Clinical task added to server');
      setNewText('');
      setDurationMinutes('0');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add task');
    }
  };

  const handleToggle = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const data = await doctorService.toggleTodo(id);
      setTodos(data);
    } catch (err) {
      setTodos((prev) =>
        prev.map((t) => (t._id === id || t.id === id ? { ...t, done: !t.done } : t))
      );
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const data = await doctorService.deleteTodo(id);
      setTodos(data);
      toast.info('Task removed');
    } catch (err) {
      setTodos((prev) => prev.filter((t) => t._id !== id && t.id !== id));
      toast.info('Task removed');
    }
  };

  const startEdit = (todo: TodoItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const todoId = todo._id || todo.id || '';
    setEditingId(todoId);
    setEditText(todo.text);
    setEditDuration(todo.durationMinutes ? todo.durationMinutes.toString() : '0');
  };

  const saveEdit = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!editText.trim()) return;

    const timerMins = parseInt(editDuration, 10);

    try {
      const data = await doctorService.editTodo({
        todoId: id,
        text: editText.trim(),
        durationMinutes: timerMins > 0 ? timerMins : null,
      });
      setTodos(data);
      toast.success('Task updated');
      setEditingId(null);
      setEditText('');
    } catch (err: any) {
      toast.error('Failed to update task');
    }
  };

  const pendingCount = todos.filter((t) => !t.done).length;

  const filteredTodos = todos.filter((t) => {
    if (activeFilter === 'pending') return !t.done;
    if (activeFilter === 'completed') return t.done;
    return true;
  });

  const renderRemainingTimer = (todo: TodoItem) => {
    if (!todo.durationMinutes || todo.done) return null;

    const createdTime = new Date(todo.createdAt).getTime();
    const durationMs = todo.durationMinutes * 60 * 1000;
    const expiryTime = createdTime + durationMs;
    const remainingMs = expiryTime - nowTime;

    if (remainingMs <= 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md animate-pulse">
          <AlertCircle className="w-3 h-3 text-rose-600" /> Timer Expired!
        </span>
      );
    }

    const totalSeconds = Math.floor(remainingMs / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-md">
        <Timer className="w-3 h-3 text-teal-600 animate-spin" /> {timeFormatted} left
      </span>
    );
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-3 w-80 sm:w-[420px] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
    >
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-600 via-blue-500 to-teal-500 text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white ring-1 ring-white/30">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2 leading-tight">
              Clinical Workstation To-Dos
              {pendingCount > 0 && (
                <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {pendingCount} pending
                </span>
              )}
            </h3>
            <p className="text-[10px] text-blue-100">Synced to Doctor DB schema</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/15 text-blue-100 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Add Form */}
      <div className="p-3 bg-blue-50/60 border-b border-blue-100 space-y-2.5">
        <form onSubmit={handleAdd} className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Add patient task or prescription reminder..."
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-medium focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-2xs"
              required
            />
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1 flex-shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold text-gray-600 px-1">
            <div className="flex items-center gap-1.5">
              <span>Priority:</span>
              <button
                type="button"
                onClick={() => setPriority('normal')}
                className={`px-2 py-0.5 rounded-md border transition-all ${
                  priority === 'normal'
                    ? 'bg-blue-100 text-blue-700 border-blue-300 font-bold'
                    : 'bg-white text-gray-500 border-gray-200'
                }`}
              >
                Normal
              </button>
              <button
                type="button"
                onClick={() => setPriority('urgent')}
                className={`px-2 py-0.5 rounded-md border transition-all flex items-center gap-0.5 ${
                  priority === 'urgent'
                    ? 'bg-rose-100 text-rose-700 border-rose-300 font-bold'
                    : 'bg-white text-gray-500 border-gray-200'
                }`}
              >
                <AlertCircle className="w-2.5 h-2.5 text-rose-500" /> Urgent
              </button>
            </div>

            {/* Optional Timer Selector */}
            <div className="flex items-center gap-1">
              <Timer className="w-3 h-3 text-teal-600" />
              <span>Timer:</span>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="px-2 py-0.5 rounded-md border border-gray-200 bg-white text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="0">No Timer</option>
                <option value="5">5 mins</option>
                <option value="15">15 mins</option>
                <option value="30">30 mins</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
              </select>
            </div>
          </div>
        </form>
      </div>

      {/* Filter Tabs */}
      <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-gray-200">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-2.5 py-0.5 rounded-md font-semibold text-[11px] transition-all ${
              activeFilter === 'all'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All ({todos.length})
          </button>
          <button
            onClick={() => setActiveFilter('pending')}
            className={`px-2.5 py-0.5 rounded-md font-semibold text-[11px] transition-all ${
              activeFilter === 'pending'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setActiveFilter('completed')}
            className={`px-2.5 py-0.5 rounded-md font-semibold text-[11px] transition-all ${
              activeFilter === 'completed'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Done
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
        {loading ? (
          <div className="p-8 text-center text-gray-400">
            <p className="text-xs font-semibold animate-pulse">Loading workstation tasks...</p>
          </div>
        ) : filteredTodos.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <CheckSquare className="w-8 h-8 mx-auto mb-2 text-gray-200 stroke-1" />
            <p className="text-xs font-semibold text-gray-600">No clinical tasks found</p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {activeFilter === 'pending'
                ? 'All patient follow-up tasks completed!'
                : 'Add a new task with optional timer above.'}
            </p>
          </div>
        ) : (
          filteredTodos.map((todo) => {
            const todoId = todo._id || todo.id || '';
            return (
              <div
                key={todoId}
                onClick={(e) => handleToggle(todoId, e)}
                className={`p-3 transition-colors flex items-center justify-between gap-2.5 cursor-pointer group ${
                  todo.done
                    ? 'bg-gray-50/70 text-gray-400 line-through'
                    : todo.priority === 'urgent'
                    ? 'bg-rose-50/30 hover:bg-rose-50/60 text-gray-900'
                    : 'bg-white hover:bg-teal-50/40 text-gray-900'
                }`}
              >
                {/* Checkbox + Task Details */}
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={todo.done}
                    onChange={() => {}}
                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer flex-shrink-0"
                  />

                  {editingId === todoId ? (
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 px-2 py-1 rounded-lg border border-blue-400 bg-white text-xs font-medium focus:outline-none"
                      autoFocus
                    />
                  ) : (
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className={`text-xs truncate font-semibold ${todo.done ? 'text-gray-400' : 'text-gray-800'}`}>
                        {todo.text}
                      </p>

                      <div className="flex flex-wrap items-center gap-2">
                        {todo.priority === 'urgent' && !todo.done && (
                          <span className="inline-block text-[9px] font-extrabold text-rose-600 bg-rose-100 px-1.5 py-0.2 rounded">
                            Urgent
                          </span>
                        )}
                        {/* Render Live Remaining Timer */}
                        {renderRemainingTimer(todo)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions (Save / Edit / Delete) */}
                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  {editingId === todoId ? (
                    <button
                      onClick={(e) => saveEdit(todoId, e)}
                      className="p-1 rounded text-emerald-600 hover:bg-emerald-50"
                      title="Save"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => startEdit(todo, e)}
                      className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                      title="Edit task"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  )}

                  <button
                    onClick={(e) => handleDelete(todoId, e)}
                    className="p-1 rounded text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                    title="Remove task"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-2 bg-gray-50 border-t border-gray-100 text-center">
        <span className="text-[10px] text-gray-400 font-medium">
          Persisted to Doctor Database Schema
        </span>
      </div>
    </div>
  );
}

export const TodoModal = TodoDropdown;
