import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

interface LoginFormData {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const { login, isLoading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isSubmitting || isLoading) return;

    const { username, password } = formData;
    
    // Basic validation
    if (!username.trim() || !password.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await login(username.trim(), password);
      // Redirect will be handled by the routing logic
    } catch (err) {
      // Error is already handled by the auth context
      console.error('Login failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const isDisabled = isLoading || isSubmitting || !formData.username.trim() || !formData.password.trim();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          <CardDescription>
            Sign in to access the NeoVantis admin dashboard
          </CardDescription>
        </CardHeader>

        <CardContent className="py-8">
          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md mb-6 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="username" className="mb-2 block">Username</Label>
              <Input
                id="username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                disabled={isLoading || isSubmitting}
                placeholder="Enter your username"
              />
            </div>

            <div>
              <Label htmlFor="password" className="mb-2 block">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading || isSubmitting}
                  placeholder="Enter your password"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={togglePasswordVisibility}
                  disabled={isLoading || isSubmitting}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isDisabled}
              className="w-full mt-8"
            >
              {(isLoading || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {(isLoading || isSubmitting) ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex-col items-center justify-center pt-6">
          <p className="text-sm text-muted-foreground">NeoVantis Admin Dashboard</p>
          <p className="text-sm text-muted-foreground mt-1">Authorized access only</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
