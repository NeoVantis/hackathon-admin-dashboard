import React from 'react';
import { useAuth } from '../hooks/useAuth';

const UserManagement: React.FC = () => {
  const { admin, isSuperAdmin } = useAuth();

  if (!isSuperAdmin()) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '80vh',
        backgroundColor: '#f5f5f5',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          padding: '40px',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🚫</div>
          <h2 style={{ color: '#e74c3c', margin: '0 0 15px 0' }}>
            Super Admin Access Required
          </h2>
          <p style={{ color: '#666', margin: '0', lineHeight: '1.5' }}>
            This section is only available to super administrators.
            <br />
            Your current role: <strong>{admin?.role}</strong>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#333' }}>
          🛡️ User Management (Super Admin Only)
        </h2>
        
        <div style={{
          backgroundColor: '#e8f4fd',
          border: '1px solid #bee5eb',
          borderRadius: '4px',
          padding: '15px',
          marginBottom: '20px'
        }}>
          <strong>Note:</strong> This is a demonstration of role-based access control. 
          Only super administrators can view this page.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div style={{
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            padding: '20px'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Admin Users</h3>
            <p style={{ margin: '0 0 15px 0', color: '#666' }}>
              Manage admin user accounts and permissions
            </p>
            <button style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              Manage Users
            </button>
          </div>

          <div style={{
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            padding: '20px'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Role Permissions</h3>
            <p style={{ margin: '0 0 15px 0', color: '#666' }}>
              Configure roles and their associated permissions
            </p>
            <button style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              Configure Roles
            </button>
          </div>

          <div style={{
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            padding: '20px'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>System Settings</h3>
            <p style={{ margin: '0 0 15px 0', color: '#666' }}>
              Modify system-wide configuration settings
            </p>
            <button style={{
              backgroundColor: '#ffc107',
              color: '#212529',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              System Config
            </button>
          </div>
        </div>

        <div style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '4px'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>
            Current Session Info
          </h4>
          <div style={{ fontSize: '14px', color: '#856404' }}>
            <p style={{ margin: '5px 0' }}>
              <strong>User:</strong> {admin?.username}
            </p>
            <p style={{ margin: '5px 0' }}>
              <strong>Role:</strong> {admin?.role}
            </p>
            <p style={{ margin: '5px 0' }}>
              <strong>Permissions:</strong> {admin?.permissions?.join(', ') || 'None specified'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
