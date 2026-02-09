// API Integration Skill for frontend-backend communication
class ApiIntegrationSkill {
  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    this.token = null;
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
  }

  // Remove authentication token
  removeToken() {
    this.token = null;
  }

  // Helper method to create headers
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Authentication methods
  async register(userData) {
    try {
      console.log('Registering user with API URL:', this.baseUrl);
      console.log('Request data:', { ...userData, password: '***' });

      const response = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(userData),
        mode: 'cors',
        credentials: 'include',
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('Server error:', error);
        throw new Error(error.detail || 'Registration failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Registration error:', error);
      if (error.message === 'Failed to fetch') {
        throw new Error(`Cannot connect to backend at ${this.baseUrl}. Make sure the backend server is running.`);
      }
      throw error;
    }
  }

  async login(credentials) {
    try {
      console.log('Logging in with API URL:', this.baseUrl);
      console.log('Username:', credentials.username);

      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password
        }),
        mode: 'cors',
        credentials: 'include',
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('Server error:', error);
        throw new Error(error.detail || 'Login failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Login error:', error);
      if (error.message === 'Failed to fetch') {
        throw new Error(`Cannot connect to backend at ${this.baseUrl}. Make sure the backend server is running.`);
      }
      throw error;
    }
  }

  async logout() {
    try {
      const response = await fetch(`${this.baseUrl}/auth/logout`, {
        method: 'POST',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Logout failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  // Task methods
  async getTasks(filters = {}) {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User not authenticated. Please login again.');
      }

      const params = new URLSearchParams(filters);
      const response = await fetch(`${this.baseUrl}/api/${userId}/tasks?${params}`, {
        method: 'GET',
        headers: this.getHeaders(),
        mode: 'cors',
        credentials: 'include',
      });

      console.log('Get tasks response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to fetch tasks');
      }

      const result = await response.json();
      console.log('Tasks fetched:', result);
      return result.tasks || result; // Handle both TaskListResponse and plain array
    } catch (error) {
      console.error('Get tasks error:', error);
      if (error.message === 'Failed to fetch') {
        throw new Error(`Cannot connect to backend at ${this.baseUrl}`);
      }
      throw error;
    }
  }

  async createTask(taskData) {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User not authenticated. Please login again.');
      }

      console.log('Creating task:', taskData);
      console.log('API URL:', this.baseUrl);
      console.log('User ID:', userId);
      console.log('Has token:', !!this.token);

      const response = await fetch(`${this.baseUrl}/api/${userId}/tasks`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(taskData),
        mode: 'cors',
        credentials: 'include',
      });

      console.log('Create task response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('Create task error response:', error);
        throw new Error(error.detail || 'Failed to create task');
      }

      const result = await response.json();
      console.log('Task created successfully:', result);
      return result;
    } catch (error) {
      console.error('Create task error:', error);
      if (error.message === 'Failed to fetch') {
        throw new Error(`Cannot connect to backend at ${this.baseUrl}. Make sure the backend server is running.`);
      }
      throw error;
    }
  }

  async updateTask(taskId, taskData) {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User not authenticated. Please login again.');
      }

      const response = await fetch(`${this.baseUrl}/api/${userId}/tasks/${taskId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(taskData),
        mode: 'cors',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update task');
      }

      return await response.json();
    } catch (error) {
      console.error('Update task error:', error);
      throw error;
    }
  }

  async deleteTask(taskId) {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User not authenticated. Please login again.');
      }

      console.log('Deleting task:', taskId);

      const response = await fetch(`${this.baseUrl}/api/${userId}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
        mode: 'cors',
        credentials: 'include',
      });

      console.log('Delete response status:', response.status);

      if (!response.ok) {
        let errorMessage = 'Failed to delete task';
        try {
          const error = await response.json();
          errorMessage = error.detail || errorMessage;
        } catch (e) {
          // Response might not have JSON body
          errorMessage = `Failed to delete task (${response.status} ${response.statusText})`;
        }
        throw new Error(errorMessage);
      }

      // Delete might return 204 No Content or empty response
      // Try to parse JSON, but don't fail if there's no content
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const result = await response.json();
        console.log('Task deleted successfully:', result);
        return result;
      } else {
        console.log('Task deleted successfully (no content)');
        return { success: true, message: 'Task deleted successfully' };
      }
    } catch (error) {
      console.error('Delete task error:', error);
      throw error;
    }
  }

  async updateTaskCompletion(taskId, isCompleted) {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User not authenticated. Please login again.');
      }

      console.log('Updating task completion:', taskId, 'to', isCompleted);

      const response = await fetch(`${this.baseUrl}/api/${userId}/tasks/${taskId}/complete`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ completed: isCompleted }), // Backend expects 'completed', not 'is_completed'
        mode: 'cors',
        credentials: 'include',
      });

      console.log('Update completion response status:', response.status);

      if (!response.ok) {
        let errorMessage = 'Failed to update task completion';
        try {
          const error = await response.json();
          errorMessage = error.detail || errorMessage;
        } catch (e) {
          errorMessage = `Failed to update task completion (${response.status} ${response.statusText})`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Task completion updated:', result);
      return result;
    } catch (error) {
      console.error('Update task completion error:', error);
      if (error.message === 'Failed to fetch') {
        throw new Error(`Cannot connect to backend at ${this.baseUrl}`);
      }
      throw error;
    }
  }
}

// Export singleton instance
export const apiSkill = new ApiIntegrationSkill();
export default ApiIntegrationSkill;