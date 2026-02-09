/**
 * Task Priority Storage Utility
 *
 * Since the backend doesn't support priority field yet,
 * we store priorities locally in browser storage.
 */

const STORAGE_KEY = 'task_priorities';

/**
 * Get all task priorities from localStorage
 */
export function getAllPriorities() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error loading priorities:', error);
    return {};
  }
}

/**
 * Set priority for a task
 */
export function setPriority(taskId, priority) {
  try {
    const priorities = getAllPriorities();
    priorities[taskId] = priority;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(priorities));
  } catch (error) {
    console.error('Error saving priority:', error);
  }
}

/**
 * Get priority for a task (defaults to 'medium' if not set)
 */
export function getPriority(taskId) {
  const priorities = getAllPriorities();
  return priorities[taskId] || 'medium';
}

/**
 * Remove priority for a task
 */
export function removePriority(taskId) {
  try {
    const priorities = getAllPriorities();
    delete priorities[taskId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(priorities));
  } catch (error) {
    console.error('Error removing priority:', error);
  }
}

/**
 * Attach priorities to tasks array
 */
export function attachPriorities(tasks) {
  return tasks.map(task => ({
    ...task,
    priority: getPriority(task.id)
  }));
}
