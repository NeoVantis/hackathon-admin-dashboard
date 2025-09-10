import { createContext } from 'react';

// Types matching the API response
export interface Admin {
  id: string;
  name: string;
  username: string;
  role: number; // 0 = Super Admin, 1 = Admin
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  // State
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
  
  // Actions
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  
  // Role-based access helpers
  hasRole: (role: number) => boolean;
  isSuperAdmin: () => boolean;
  isRegularAdmin: () => boolean;
  getRoleName: () => string;
}

// Create context
export const AuthContext = createContext<AuthContextType | null>(null);

export default AuthContext;
