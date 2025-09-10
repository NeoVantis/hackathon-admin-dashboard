import React from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import Login from './Login';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
  requiredPermission?: string;
  fallback?: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredPermission,
  fallback
}) => {
  const { 
    isAuthenticated, 
    isLoading, 
    admin, 
    hasRole, 
    hasPermission,
    isSuperAdmin 
  } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '20px',
            animation: 'spin 1s linear infinite'
          }}>
            🔄
          </div>
          <h2 style={{ color: '#333', margin: '0 0 10px 0' }}>
            Authenticating...
          </h2>
          <p style={{ color: '#666', margin: '0' }}>
            Please wait while we verify your credentials
          </p>
        </div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  // If not authenticated, show login page
  if (!isAuthenticated) {
    return <Login />;
  }

  // If authenticated but doesn't have required role
  if (requiredRole && !hasRole(requiredRole) && !isSuperAdmin()) {
    return (
      fallback || (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#f5f5f5',
          fontFamily: 'Arial, sans-serif'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            padding: '40px',
            textAlign: 'center',
            maxWidth: '500px',
            margin: '20px'
          }}>
            <div style={{
              fontSize: '64px',
              marginBottom: '20px'
            }}>
              🚫
            </div>
            <h2 style={{
              color: '#e74c3c',
              margin: '0 0 15px 0',
              fontSize: '24px'
            }}>
              Access Denied
            </h2>
            <p style={{
              color: '#666',
              margin: '0 0 20px 0',
              lineHeight: '1.5'
            }}>
              You don't have permission to access this page.
              <br />
              Required role: <strong>{requiredRole}</strong>
              <br />
              Your role: <strong>{admin?.role || 'Unknown'}</strong>
            </p>
            <div style={{
              backgroundColor: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              padding: '15px',
              fontSize: '14px',
              color: '#6c757d'
            }}>
              Contact your system administrator if you believe this is an error.
            </div>
          </div>
        </div>
      )
    );
  }

  // If authenticated but doesn't have required permission
  if (requiredPermission && !hasPermission(requiredPermission) && !isSuperAdmin()) {
    return (
      fallback || (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#f5f5f5',
          fontFamily: 'Arial, sans-serif'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            padding: '40px',
            textAlign: 'center',
            maxWidth: '500px',
            margin: '20px'
          }}>
            <div style={{
              fontSize: '64px',
              marginBottom: '20px'
            }}>
              🔒
            </div>
            <h2 style={{
              color: '#e74c3c',
              margin: '0 0 15px 0',
              fontSize: '24px'
            }}>
              Insufficient Permissions
            </h2>
            <p style={{
              color: '#666',
              margin: '0 0 20px 0',
              lineHeight: '1.5'
            }}>
              You don't have the required permission to access this feature.
              <br />
              Required permission: <strong>{requiredPermission}</strong>
            </p>
            <div style={{
              backgroundColor: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              padding: '15px',
              fontSize: '14px',
              color: '#6c757d'
            }}>
              Your permissions: {admin?.permissions?.join(', ') || 'None'}
            </div>
          </div>
        </div>
      )
    );
  }

  // If all checks pass, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
