// Auth API Service for NeoVantis Admin API

export interface Admin {
  id: string;
  name: string;
  username: string;
  role: number; // 0 = Super Admin, 1 = Admin
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  userRole: number;
}

export interface AdminProfileResponse {
  admin: Admin;
}

export interface CreateAdminRequest {
  name: string;
  username: string;
  password: string;
  role: number;
}

export interface ApiError {
  message: string;
  error: string;
  statusCode: number;
}

class AuthApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = '/api/v1'; // Use relative path - will be proxied by Vite
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
   * Get current admin profile
   */
  async getCurrentAdmin(token: string): Promise<Admin> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data: AdminProfileResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.admin ? 'Invalid admin token' : 'Admin access token required');
      }

      return data.admin;
    } catch (error) {
      console.error('❌ Get Admin Profile API Error:', error);
      
      if (error instanceof Error) {
        throw new Error(`Failed to get admin info: ${error.message}`);
      }
      
      throw new Error('Failed to get admin info: Unknown error occurred');
    }
  }

  /**
   * Create new admin (Super Admin only)
   */
  async createAdmin(token: string, adminData: CreateAdminRequest): Promise<Admin> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(adminData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error('❌ Create Admin API Error:', error);
      
      if (error instanceof Error) {
        throw new Error(`Failed to create admin: ${error.message}`);
      }
      
      throw new Error('Failed to create admin: Unknown error occurred');
    }
  }

  /**
   * Get all admins (Super Admin only)
   */
  async getAllAdmins(token: string): Promise<Admin[]> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/list`, {
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
      console.error('❌ Get All Admins API Error:', error);
      
      if (error instanceof Error) {
        throw new Error(`Failed to get admin list: ${error.message}`);
      }
      
      throw new Error('Failed to get admin list: Unknown error occurred');
    }
  }

  /**
   * Validate token by trying to get current admin
   */
  async validateToken(token: string): Promise<{ valid: boolean; admin?: Admin }> {
    try {
      const admin = await this.getCurrentAdmin(token);
      return { valid: true, admin };
    } catch (error) {
      return { valid: false };
    }
  }
}

// Export singleton instance
export const authApiService = new AuthApiService();
export default authApiService;
