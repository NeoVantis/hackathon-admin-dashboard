# Admin Dashboard Authentication Integration

This document explains how to use the admin authentication system integrated into the NeoVantis Admin Dashboard.

## Overview

The dashboard now includes comprehensive admin authentication with the following features:

- ✅ JWT-based authentication with NeoVantis AuthService
- ✅ Secure token storage (localStorage with future httpOnly cookie support)
- ✅ Protected routes and components
- ✅ Role-based access control (RBAC)
- ✅ Automatic token validation and refresh
- ✅ Clean login/logout experience
- ✅ Error handling and user feedback

## Architecture

### Components

1. **AuthProvider** (`src/contexts/AuthContext.tsx`)
   - Manages authentication state across the app
   - Handles login, logout, and token validation
   - Provides role-based access helper functions

2. **useAuth Hook** (`src/hooks/useAuth.ts`)
   - Custom hook to access authentication context
   - Used throughout components to check auth status

3. **AuthApiService** (`src/services/authApi.ts`)
   - Handles API calls to NeoVantis AuthService
   - Manages JWT tokens in request headers
   - Provides error handling for auth requests

4. **Login Component** (`src/components/Login.tsx`)
   - Beautiful login form with email/password
   - Error handling and loading states
   - Auto-redirects on successful login

5. **ProtectedRoute Component** (`src/components/ProtectedRoute.tsx`)
   - Wraps components that require authentication
   - Supports role-based and permission-based access
   - Redirects to login if not authenticated

6. **Enhanced Sidebar** (`src/components/Sidebar.tsx`)
   - Shows current user info and role
   - Logout button with confirmation
   - Role-based menu items (e.g., User Management for super admins)

## Environment Configuration

Add these environment variables to your `.env` file:

```env
# Authentication Service Configuration
VITE_AUTH_API_BASE_URL=http://localhost:3000/api/v1

# Notification Service Configuration (existing)
VITE_NOTIFICATION_HEALTH_API_URL=http://notification-service.neovantis.xyz/api/v1/health
```

## API Endpoints Expected

The dashboard expects your NeoVantis AuthService to provide these endpoints:

### POST /api/v1/admin/login
**Request:**
```json
{
  "email": "admin@neovantis.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "admin_123",
    "email": "admin@neovantis.com",
    "role": "super_admin",
    "name": "John Doe",
    "permissions": ["read:users", "write:users", "read:system", "write:system"]
  }
}
```

### GET /api/v1/admin/validate
**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Token valid",
  "admin": {
    "id": "admin_123",
    "email": "admin@neovantis.com",
    "role": "super_admin",
    "name": "John Doe",
    "permissions": ["read:users", "write:users", "read:system", "write:system"]
  }
}
```

### POST /api/v1/admin/logout (Optional)
**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Role-Based Access Control

### Supported Roles

- `admin` - Basic admin access
- `super_admin` / `superadmin` - Full system access
- Custom roles can be added as needed

### Permission System

The system supports granular permissions:
- `read:users` - View user data
- `write:users` - Modify user data
- `read:system` - View system settings
- `write:system` - Modify system settings
- Custom permissions can be added

### Usage Examples

#### Protecting a Component by Role
```tsx
// Only super admins can access
<ProtectedRoute requiredRole="super_admin">
  <UserManagement />
</ProtectedRoute>
```

#### Protecting a Component by Permission
```tsx
// Only users with write:system permission
<ProtectedRoute requiredPermission="write:system">
  <SystemSettings />
</ProtectedRoute>
```

#### Checking Access in Components
```tsx
import { useAuth } from '../hooks/useAuth';

function MyComponent() {
  const { hasRole, hasPermission, isSuperAdmin } = useAuth();

  if (!hasRole('admin')) {
    return <div>Access denied</div>;
  }

  return (
    <div>
      <h1>Admin Panel</h1>
      {isSuperAdmin() && (
        <button>Super Admin Feature</button>
      )}
      {hasPermission('write:users') && (
        <button>Edit Users</button>
      )}
    </div>
  );
}
```

## Security Features

### Token Storage
- Currently uses localStorage for development
- Easy to migrate to httpOnly cookies for production
- Automatic token cleanup on logout

### Token Validation
- Validates token on app startup
- Handles expired tokens gracefully
- Auto-redirects to login on authentication failure

### API Security
- All protected requests include JWT in Authorization header
- Error handling for network issues and auth failures
- Automatic retry logic for token refresh

## User Experience

### Login Flow
1. User visits any protected route
2. If not authenticated, redirected to login page
3. User enters credentials and submits form
4. On success, token is stored and user is redirected to dashboard
5. On error, user sees helpful error message

### Logout Flow
1. User clicks logout button in sidebar
2. Token is cleared from storage
3. Server logout endpoint is called (optional)
4. User is redirected to login page

### Session Management
- Token validity is checked on app startup
- Invalid/expired tokens are automatically cleared
- User stays logged in across browser sessions (until token expires)

## Development Notes

### Adding New Protected Routes
```tsx
// In App.tsx
<Route 
  path="/new-feature" 
  element={
    <ProtectedRoute requiredRole="admin">
      <NewFeatureComponent />
    </ProtectedRoute>
  } 
/>
```

### Adding New Role-Based Menu Items
```tsx
// In Sidebar.tsx
const getAvailableServices = () => {
  const baseServices = [...services];
  
  if (hasRole('manager')) {
    baseServices.push({
      id: 'reports',
      name: 'Reports',
      icon: '📊',
      description: 'View system reports'
    });
  }
  
  return baseServices;
};
```

### Making Authenticated API Calls
```tsx
import { authApiService } from '../services/authApi';

// In your component
const fetchProtectedData = async () => {
  try {
    const data = await authApiService.makeAuthenticatedRequest('/some-endpoint');
    console.log('Protected data:', data);
  } catch (error) {
    console.error('Failed to fetch protected data:', error);
  }
};
```

## Testing the Authentication

1. **Start your NeoVantis AuthService** on `http://localhost:3000`
2. **Start the dashboard**: `npm run dev`
3. **Visit the dashboard** - you should be redirected to login
4. **Try logging in** with valid admin credentials
5. **Check role-based access** by logging in with different role users
6. **Test logout functionality**

## Troubleshooting

### Common Issues

1. **"Cannot connect to AuthService"**
   - Ensure AuthService is running on correct port
   - Check VITE_AUTH_API_BASE_URL in .env file
   - Verify network connectivity

2. **"Token validation failed"**
   - Check JWT token format and signing key
   - Ensure /admin/validate endpoint is implemented
   - Verify token hasn't expired

3. **"Access denied" for valid users**
   - Check user role matches required role
   - Verify permissions are correctly assigned
   - Check role name spelling and case sensitivity

4. **Login form not submitting**
   - Check browser console for JavaScript errors
   - Verify form validation is passing
   - Check network tab for failed requests

### Debug Mode

Add this to your component to see current auth state:
```tsx
const { admin, isAuthenticated, isLoading, error } = useAuth();
console.log('Auth Debug:', { admin, isAuthenticated, isLoading, error });
```

## Future Enhancements

- [ ] Migrate to httpOnly cookies for enhanced security
- [ ] Add password reset functionality
- [ ] Implement refresh token rotation
- [ ] Add audit logging for authentication events
- [ ] Support for multi-factor authentication (MFA)
- [ ] Session timeout warnings
- [ ] Remember me functionality

---

🔒 **Security Note**: This implementation is designed for development and testing. For production use, ensure proper HTTPS, secure token storage, and additional security measures are in place.
