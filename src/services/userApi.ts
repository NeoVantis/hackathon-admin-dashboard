// User Management API Service for Admin Dashboard

import type {
  User,
  GetUsersResponse,
  GetUsersQuery,
  DeactivateUserRequest,
  UserActionResponse,
  ApiError
} from '../types/user';

class UserApiService {
  private baseUrl: string;
  private timeout: number;
  private debugMode: boolean;

  constructor() {
    this.baseUrl = import.meta.env.VITE_USER_API_URL || '/api/v1/admin/users';
    this.timeout = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000');
    this.debugMode = import.meta.env.VITE_DEBUG_API === 'true';
  }

  /**
   * Log API requests in development mode
   */
  private log(message: string, data?: unknown) {
    if (this.debugMode) {
      console.log(`[UserAPI] ${message}`, data);
    }
  }

  /**
   * Create fetch request with timeout and error handling
   */
  private async fetchWithTimeout(
    url: string, 
    options: RequestInit = {}
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout - please try again');
      }
      throw error;
    }
  }

  /**
   * Handle API response and extract data
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json();

    if (!response.ok) {
      const apiError: ApiError = data;
      throw new Error(apiError.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return data;
  }

  /**
   * Get paginated list of users with optional filters
   */
  async getAllUsers(token: string, query: GetUsersQuery = {}): Promise<GetUsersResponse> {
    try {
      this.log('Getting users list', query);

      // Build query parameters
      const searchParams = new URLSearchParams();
      
      if (query.page) searchParams.append('page', query.page.toString());
      if (query.limit) searchParams.append('limit', query.limit.toString());
      if (query.verified !== undefined) searchParams.append('verified', query.verified.toString());
      if (query.active !== undefined) searchParams.append('active', query.active.toString());
      if (query.search) searchParams.append('search', query.search);

      const url = `${this.baseUrl}?${searchParams.toString()}`;

      const response = await this.fetchWithTimeout(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await this.handleResponse<GetUsersResponse>(response);
      this.log('Users list retrieved successfully', { count: data.users.length });
      
      return data;
    } catch (error) {
      this.log('Error getting users list', error);
      
      if (error instanceof Error) {
        throw new Error(`Failed to load users: ${error.message}`);
      }
      
      throw new Error('Failed to load users: Unknown error occurred');
    }
  }

  /**
   * Get detailed information for a specific user
   */
  async getUserDetails(token: string, userId: string): Promise<User> {
    try {
      this.log('Getting user details', { userId });

      const response = await this.fetchWithTimeout(`${this.baseUrl}/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await this.handleResponse<{ user: User }>(response);
      this.log('User details retrieved successfully', { userId });
      
      return data.user;
    } catch (error) {
      this.log('Error getting user details', { userId, error });
      
      if (error instanceof Error) {
        throw new Error(`Failed to get user details: ${error.message}`);
      }
      
      throw new Error('Failed to get user details: Unknown error occurred');
    }
  }

  /**
   * Deactivate a user account (soft delete)
   */
  async deactivateUser(
    token: string, 
    userId: string, 
    reason?: string
  ): Promise<UserActionResponse> {
    try {
      this.log('Deactivating user', { userId, reason });

      const body: DeactivateUserRequest = {};
      if (reason) body.reason = reason;

      const response = await this.fetchWithTimeout(`${this.baseUrl}/${userId}/deactivate`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await this.handleResponse<UserActionResponse>(response);
      this.log('User deactivated successfully', { userId });
      
      return data;
    } catch (error) {
      this.log('Error deactivating user', { userId, error });
      
      if (error instanceof Error) {
        throw new Error(`Failed to deactivate user: ${error.message}`);
      }
      
      throw new Error('Failed to deactivate user: Unknown error occurred');
    }
  }

  /**
   * Reactivate a user account
   */
  async reactivateUser(token: string, userId: string): Promise<UserActionResponse> {
    try {
      this.log('Reactivating user', { userId });

      const response = await this.fetchWithTimeout(`${this.baseUrl}/${userId}/reactivate`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await this.handleResponse<UserActionResponse>(response);
      this.log('User reactivated successfully', { userId });
      
      return data;
    } catch (error) {
      this.log('Error reactivating user', { userId, error });
      
      if (error instanceof Error) {
        throw new Error(`Failed to reactivate user: ${error.message}`);
      }
      
      throw new Error('Failed to reactivate user: Unknown error occurred');
    }
  }

  /**
   * Search users by username or email
   */
  async searchUsers(
    token: string, 
    searchTerm: string, 
    options: Omit<GetUsersQuery, 'search'> = {}
  ): Promise<GetUsersResponse> {
    return this.getAllUsers(token, {
      ...options,
      search: searchTerm,
    });
  }

  /**
   * Get user statistics for dashboard
   */
  async getUserStats(token: string): Promise<{
    total: number;
    active: number;
    inactive: number;
    verified: number;
    unverified: number;
  }> {
    try {
      this.log('Getting user statistics');

      const response = await this.fetchWithTimeout(`${this.baseUrl}/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await this.handleResponse<{
        total: number;
        active: number;
        inactive: number;
        verified: number;
        unverified: number;
      }>(response);
      
      this.log('User statistics retrieved successfully', data);
      return data;
    } catch (error) {
      this.log('Error getting user statistics', error);
      
      if (error instanceof Error) {
        throw new Error(`Failed to get user statistics: ${error.message}`);
      }
      
      throw new Error('Failed to get user statistics: Unknown error occurred');
    }
  }

  /**
   * Export users data to CSV
   */
  async exportUsers(token: string, filters: GetUsersQuery = {}): Promise<Blob> {
    try {
      this.log('Exporting users data', filters);

      const searchParams = new URLSearchParams();
      if (filters.verified !== undefined) searchParams.append('verified', filters.verified.toString());
      if (filters.active !== undefined) searchParams.append('active', filters.active.toString());
      if (filters.search) searchParams.append('search', filters.search);

      const url = `${this.baseUrl}/export?${searchParams.toString()}`;

      const response = await this.fetchWithTimeout(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/csv',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Export failed');
      }

      const blob = await response.blob();
      this.log('Users data exported successfully');
      
      return blob;
    } catch (error) {
      this.log('Error exporting users data', error);
      
      if (error instanceof Error) {
        throw new Error(`Failed to export users: ${error.message}`);
      }
      
      throw new Error('Failed to export users: Unknown error occurred');
    }
  }
}

// Export singleton instance
export const userApiService = new UserApiService();
export default userApiService;
