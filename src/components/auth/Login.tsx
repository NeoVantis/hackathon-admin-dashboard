import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

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

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        padding: '40px',
        margin: '20px'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{
            margin: '0 0 10px 0',
            fontSize: '28px',
            color: '#333',
            fontWeight: 'bold'
          }}>
            Admin Login
          </h1>
          <p style={{
            margin: '0',
            fontSize: '14px',
            color: '#666'
          }}>
            Sign in to access the NeoVantis admin dashboard
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '4px',
            padding: '12px',
            marginBottom: '20px',
            fontSize: '14px',
            color: '#c33'
          }}>
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#333'
            }}>
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              disabled={isLoading || isSubmitting}
              placeholder="Enter your username"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: (isLoading || isSubmitting) ? '#f9f9f9' : 'white',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#333'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={isLoading || isSubmitting}
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  padding: '12px 40px 12px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: (isLoading || isSubmitting) ? '#f9f9f9' : 'white',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                disabled={isLoading || isSubmitting}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: '#666',
                  padding: '4px',
                  textDecoration: 'underline'
                }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || isSubmitting || !formData.username.trim() || !formData.password.trim()}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: (isLoading || isSubmitting || !formData.username.trim() || !formData.password.trim()) 
                ? '#ccc' 
                : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: (isLoading || isSubmitting || !formData.username.trim() || !formData.password.trim()) 
                ? 'not-allowed' 
                : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {(isLoading || isSubmitting) ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <div style={{
          marginTop: '30px',
          textAlign: 'center',
          fontSize: '12px',
          color: '#999'
        }}>
          <p style={{ margin: '0' }}>
            NeoVantis Admin Dashboard
          </p>
          <p style={{ margin: '5px 0 0 0' }}>
            Authorized access only
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
