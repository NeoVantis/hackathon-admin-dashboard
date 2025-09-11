import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { AuthContext } from './AuthContextDefinition';
import type { Admin, AuthContextType } from './AuthContextDefinition';
import { authApiService } from '../services/authApi';

// Auth Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = admin !== null && token !== null;

  /**
   * Clear error state
   */
  const clearError = () => {
    setError(null);
  };

  /**
   * Clear auth state (session only - no persistence)
   */
  const clearAuthState = () => {
    setAdmin(null);
    setToken(null);
    setError(null);
  };

  /**
   * Login function
   */
  const login = async (username: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authApiService.login({ username, password });

      // Get admin profile with the token
      const adminProfile = await authApiService.getCurrentAdmin(response.access_token);

      // Save to state only (session storage)
      setAdmin(adminProfile);
      setToken(response.access_token);

      console.log('✅ Login successful:', adminProfile.username, 'Role:', adminProfile.role);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      console.error('❌ Login error:', errorMessage);
      setError(errorMessage);
      clearAuthState();
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
      
      // Clear local state (no server logout in your API)
      clearAuthState();

      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Still clear local state
      clearAuthState();
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Role-based access helper functions
   */
  const hasRole = (role: number): boolean => {
    return admin?.role === role;
  };

  const isSuperAdmin = (): boolean => {
    return admin?.role === 0; // Super Admin role is 0
  };

  const isRegularAdmin = (): boolean => {
    return admin?.role === 1; // Regular Admin role is 1
  };

  /**
   * Get role name for display
   */
  const getRoleName = (): string => {
    if (!admin) return 'Guest';
    return admin.role === 0 ? 'Super Admin' : 'Admin';
  };

  /**
   * Initialize auth state on mount (no persistence)
   */
  useEffect(() => {
    // No token persistence - user needs to login after refresh
    setIsLoading(false);
  }, []);

  const contextValue: AuthContextType = {
    // State
    admin,
    isAuthenticated,
    isLoading,
    error,
    token,
    
    // Actions
    login,
    logout,
    clearError,
    
    // Role helpers
    hasRole,
    isSuperAdmin,
    isRegularAdmin,
    getRoleName,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
