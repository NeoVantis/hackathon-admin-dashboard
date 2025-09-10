// Auth API Service for NeoVantis AuthService integration

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  admin?: {
    id: string;
    email: string;
    role: string;
    name?: string;
    permissions?: string[];
  };
}

export interface ValidateTokenResponse {
  success: boolean;
  message: string;
  admin?: {
    id: string;
    email: string;
    role: string;
    name?: string;
    permissions?: string[];
  };
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
}

class AuthApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_AUTH_API_BASE_URL || 'http://localhost:3000/api/v1';
  }

  /**
   * Login admin user
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error('❌ Login API Error:', error);
      
      if (error instanceof Error) {
        throw new Error(`Login failed: ${error.message}`);
      }
      
      throw new Error('Login failed: Unknown error occurred');
    }
  }

  /**
   * Validate JWT token
   */
  async validateToken(token: string): Promise<ValidateTokenResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/validate`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error('❌ Token Validation API Error:', error);
      
      if (error instanceof Error) {
        throw new Error(`Token validation failed: ${error.message}`);
      }
      
      throw new Error('Token validation failed: Unknown error occurred');
    }
  }

  /**
   * Logout admin (optional - mainly for token cleanup)
   */
  async logout(token: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        // Don't throw error for logout - just log it
        console.warn('⚠️ Logout API Warning:', data.message || response.statusText);
      }

      return data || { success: true, message: 'Logged out successfully' };
    } catch (error) {
      console.warn('⚠️ Logout API Warning:', error);
      
      // Return success even if logout fails - we'll clear local storage anyway
      return { success: true, message: 'Logged out locally' };
    }
  }

  /**
   * Get protected data with authentication
   */
  async makeAuthenticatedRequest<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return data;
  }
}

// Export singleton instance
export const authApiService = new AuthApiService();
export default authApiService;
