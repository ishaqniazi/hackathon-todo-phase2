'use client';

import React, { useState } from 'react';

const TaskCard = ({ task, onUpdate, onDelete, onToggleComplete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description || '',
    priority: task.priority
  });

  const handleSaveEdit = async () => {
    try {
      await onUpdate(task.id, editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditData({
      title: task.title,
      description: task.description || '',
      priority: task.priority
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      onDelete(task.id);
    }
  };

  const handleToggleComplete = () => {
    onToggleComplete(task.id, task.completed);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden border-l-4 ${
      task.completed ? 'border-green-500' :
      task.priority === 'high' ? 'border-red-500' :
      task.priority === 'medium' ? 'border-yellow-500' : 'border-green-500'
    }`}>
      {isEditing ? (
        <div className="p-4">
          <input
            type="text"
            value={editData.title}
            onChange={(e) => setEditData({...editData, title: e.target.value})}
            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-2 font-semibold text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Task title"
          />
          <textarea
            value={editData.description}
            onChange={(e) => setEditData({...editData, description: e.target.value})}
            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Task description"
            rows="3"
          />
          <select
            value={editData.priority}
            onChange={(e) => setEditData({...editData, priority: e.target.value})}
            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
          <div className="flex space-x-2">
            <button
              onClick={handleSaveEdit}
              className="flex-1 bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700"
            >
              Save
            </button>
            <button
              onClick={handleCancelEdit}
              className="flex-1 bg-gray-600 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4">
          <div className="flex justify-between items-start">
            <h3 className={`text-lg font-semibold ${
              task.completed ? 'line-through text-gray-500' : 'text-gray-900'
            }`}>
              {task.title}
            </h3>
            <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
          </div>

          {task.description && (
            <p className={`mt-2 text-sm ${
              task.completed ? 'line-through text-gray-500' : 'text-gray-600'
            }`}>
              {task.description}
            </p>
          )}

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={handleToggleComplete}
                className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-600">
                {task.completed ? 'Completed' : 'Mark as complete'}
              </span>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditing(true)}
                className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="text-red-600 hover:text-red-900 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>

          <div className="mt-3 text-xs text-gray-500">
            Created: {new Date(task.created_at).toLocaleDateString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;