import React from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Login from './Login';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Loader2, ShieldX } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: number;
  fallback?: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  fallback
}) => {
  const {
    isAuthenticated,
    isLoading,
    admin,
    hasRole,
    isSuperAdmin
  } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Authenticating...</p>
        </div>
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
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <ShieldX className="h-12 w-12 text-destructive" />
              </div>
              <CardTitle className="text-destructive">Access Denied</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                You don't have permission to access this page.
              </p>
              <div className="bg-muted p-3 rounded-md text-sm">
                <div className="space-y-1">
                  <div>Required role: <span className="font-medium">{requiredRole}</span></div>
                  <div>Your role: <span className="font-medium">{admin?.role ?? 'Unknown'}</span></div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Contact your system administrator if you believe this is an error.
              </p>
            </CardContent>
          </Card>
        </div>
      )
    );
  }

  // If all checks pass, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
