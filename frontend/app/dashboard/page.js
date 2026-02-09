'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiSkill } from '../services/api';
import TaskCard from '../components/taskcard';
import Navbar from '../components/navbar';
import { attachPriorities, setPriority, removePriority } from '../utils/taskPriorities';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]); // Store all tasks
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [filters, setFilters] = useState({
    completed: null,
    priority: ''
  });
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium'
  });
  const router = useRouter();

  useEffect(() => {
    // Check authentication and load token
    const token = localStorage.getItem('accessToken');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
      // Redirect to login if not authenticated
      router.push('/login');
      return;
    }

    // Set token in API skill
    apiSkill.setToken(token);

    // Fetch tasks
    fetchTasks();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, allTasks]);

  const fetchTasks = async () => {
    try {
      setLoading(true);

      // Only pass completed filter to backend (backend doesn't support priority yet)
      const backendFilters = {};
      if (filters.completed !== null) {
        backendFilters.completed = filters.completed;
      }

      const response = await apiSkill.getTasks(backendFilters);

      // Attach priorities from localStorage to tasks
      const tasksWithPriorities = attachPriorities(response);

      setAllTasks(tasksWithPriorities);
      applyFilters();
    } catch (err) {
      setError(err.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allTasks];

    // Apply client-side priority filter
    if (filters.priority) {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    // Apply client-side completion filter (if backend didn't filter already)
    if (filters.completed !== null) {
      filtered = filtered.filter(task => task.completed === filters.completed);
    }

    setTasks(filtered);
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      console.log('Adding task:', newTask);

      // Backend doesn't support priority, so only send title and description
      const taskData = {
        title: newTask.title,
        description: newTask.description || ''
      };

      const response = await apiSkill.createTask(taskData);
      console.log('Task added:', response);

      // Store priority in localStorage
      setPriority(response.id, newTask.priority);

      // Attach priority to response
      const taskWithPriority = {
        ...response,
        priority: newTask.priority
      };

      // Add to both lists
      setAllTasks([taskWithPriority, ...allTasks]);
      setTasks([taskWithPriority, ...tasks]);

      // Reset form
      setNewTask({ title: '', description: '', priority: 'medium' });
      setShowAddModal(false);
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Add task error:', err);
      const errorMessage = err.message || err.toString() || 'Failed to add task';
      setError(errorMessage);
    }
  };

  const handleUpdateTask = async (taskId, updatedTask) => {
    try {
      console.log('Updating task:', taskId, updatedTask);

      // Extract priority for localStorage, send rest to backend
      const { priority, ...backendData } = updatedTask;

      const response = await apiSkill.updateTask(taskId, backendData);
      console.log('Task updated:', response);

      // Update priority in localStorage if changed
      if (priority) {
        setPriority(taskId, priority);
      }

      // Attach priority to response
      const taskWithPriority = {
        ...response,
        priority: priority || tasks.find(t => t.id === taskId)?.priority || 'medium'
      };

      // Update in both lists
      setAllTasks(allTasks.map(task => task.id === taskId ? taskWithPriority : task));
      setTasks(tasks.map(task => task.id === taskId ? taskWithPriority : task));
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Update task error:', err);
      const errorMessage = err.message || err.toString() || 'Failed to update task';
      setError(errorMessage);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      console.log('Deleting task:', taskId);
      await apiSkill.deleteTask(taskId);

      // Remove priority from localStorage
      removePriority(taskId);

      // Remove from both lists
      setAllTasks(allTasks.filter(task => task.id !== taskId));
      setTasks(tasks.filter(task => task.id !== taskId));
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Delete task error:', err);
      const errorMessage = err.message || err.toString() || 'Failed to delete task';
      setError(errorMessage);
    }
  };

  const handleToggleComplete = async (taskId, isCompleted) => {
    try {
      console.log('Toggling completion for task:', taskId, 'Current state:', isCompleted);
      const response = await apiSkill.updateTaskCompletion(taskId, !isCompleted);
      console.log('Toggle response:', response);

      // Preserve priority from current task
      const currentTask = allTasks.find(t => t.id === taskId);
      const taskWithPriority = {
        ...response,
        priority: currentTask?.priority || 'medium'
      };

      // Update in both lists
      setAllTasks(allTasks.map(task => task.id === taskId ? taskWithPriority : task));
      setTasks(tasks.map(task => task.id === taskId ? taskWithPriority : task));

      // Clear any previous errors
      setError('');
    } catch (err) {
      console.error('Toggle completion error:', err);
      const errorMessage = err.message || err.toString() || 'Failed to update task completion';
      setError(errorMessage);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mt-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-lg text-gray-600">Loading tasks...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Tasks</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Add Task
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex space-x-4">
          <select
            value={filters.completed === null ? '' : filters.completed.toString()}
            onChange={(e) => handleFilterChange('completed', e.target.value === '' ? null : e.target.value === 'true')}
            className="border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
          >
            <option value="">All Tasks</option>
            <option value="false">Pending</option>
            <option value="true">Completed</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">No tasks found. Create your first task!</p>
            </div>
          ) : (
            tasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdate={handleUpdateTask}
                onDelete={handleDeleteTask}
                onToggleComplete={handleToggleComplete}
              />
            ))
          )}
        </div>

        {/* Add Task Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Task</h2>
              <form onSubmit={handleAddTask}>
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">Title *</label>
                  <input
                    type="text"
                    required
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Task title"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">Description</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Task description"
                    rows="3"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Add Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;