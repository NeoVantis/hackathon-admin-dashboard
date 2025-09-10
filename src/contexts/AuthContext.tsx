import React, { useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { AuthContext } from './AuthContextDefinition';
import type { Admin, AuthContextType } from './AuthContextDefinition';
import { authApiService } from '../services/authApi';

// Storage keys
const TOKEN_KEY = 'authToken';
const ADMIN_KEY = 'adminData';

// Auth Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = admin !== null;

  /**
   * Clear error state
   */
  const clearError = () => {
    setError(null);
  };

  /**
   * Save admin data and token to localStorage
   */
  const saveToStorage = (token: string, adminData: Admin) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ADMIN_KEY, JSON.stringify(adminData));
  };

  /**
   * Clear admin data and token from localStorage
   */
  const clearStorage = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_KEY);
  };

  /**
   * Load admin data from localStorage
   */
  const loadFromStorage = useCallback((): { token: string | null; adminData: Admin | null } => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const adminDataJson = localStorage.getItem(ADMIN_KEY);
      
      if (!token || !adminDataJson) {
        return { token: null, adminData: null };
      }

      const adminData = JSON.parse(adminDataJson) as Admin;
      return { token, adminData };
    } catch (error) {
      console.error('❌ Error loading auth data from storage:', error);
      clearStorage();
      return { token: null, adminData: null };
    }
  }, []);

  /**
   * Login function
   */
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authApiService.login({ email, password });

      if (!response.success || !response.token || !response.admin) {
        throw new Error(response.message || 'Login failed - invalid response');
      }

      // Save to state and storage
      setAdmin(response.admin);
      saveToStorage(response.token, response.admin);

      console.log('✅ Login successful:', response.admin.email);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      console.error('❌ Login error:', errorMessage);
      setError(errorMessage);
      setAdmin(null);
      clearStorage();
      throw error; // Re-throw so component can handle it
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout function
   */
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        // Try to logout on server (don't wait for it)
        authApiService.logout(token).catch(err => 
          console.warn('⚠️ Server logout failed:', err)
        );
      }

      // Clear local state and storage
      setAdmin(null);
      clearStorage();
      setError(null);

      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Still clear local state even if server logout fails
      setAdmin(null);
      clearStorage();
      setError(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Validate existing token on app startup
   */
  const validateExistingToken = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { token, adminData } = loadFromStorage();
      
      if (!token || !adminData) {
        setIsLoading(false);
        return;
      }

      // Validate token with server
      const response = await authApiService.validateToken(token);
      
      if (response.success && response.admin) {
        setAdmin(response.admin);
        // Update stored admin data in case it changed
        saveToStorage(token, response.admin);
        console.log('✅ Token validation successful:', response.admin.email);
      } else {
        throw new Error(response.message || 'Token validation failed');
      }
    } catch (error) {
      console.warn('⚠️ Token validation failed:', error);
      // Clear invalid token and data
      setAdmin(null);
      clearStorage();
      setError(null); // Don't show error for expired tokens
    } finally {
      setIsLoading(false);
    }
  }, [loadFromStorage]);

  /**
   * Role-based access helper functions
   */
  const hasRole = (role: string): boolean => {
    return admin?.role === role;
  };

  const hasPermission = (permission: string): boolean => {
    return admin?.permissions?.includes(permission) || false;
  };

  const isSuperAdmin = (): boolean => {
    return admin?.role === 'super_admin' || admin?.role === 'superadmin';
  };

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    validateExistingToken();
  }, [validateExistingToken]);

  const contextValue: AuthContextType = {
    // State
    admin,
    isAuthenticated,
    isLoading,
    error,
    
    // Actions
    login,
    logout,
    clearError,
    
    // Role helpers
    hasRole,
    hasPermission,
    isSuperAdmin,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
