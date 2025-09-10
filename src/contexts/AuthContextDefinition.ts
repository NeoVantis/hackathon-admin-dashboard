import { createContext } from 'react';

// Types
export interface Admin {
  id: string;
  email: string;
  role: string;
  name?: string;
  permissions?: string[];
}

export interface AuthContextType {
  // State
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  
  // Role-based access helpers
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  isSuperAdmin: () => boolean;
}

// Create context
export const AuthContext = createContext<AuthContextType | null>(null);

export default AuthContext;
