import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { authApiService } from '../services/authApi';
import type { Admin } from '../contexts/AuthContextDefinition';
import type { CreateAdminRequest } from '../services/authApi';

const AdminManagement: React.FC = () => {
  const { isSuperAdmin, token, getRoleName } = useAuth();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createFormData, setCreateFormData] = useState<CreateAdminRequest>({
    name: '',
    username: '',
    password: '',
    role: 1, // Default to regular admin
  });

  const loadAdmins = useCallback(async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      const adminList = await authApiService.getAllAdmins(token);
      setAdmins(adminList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admins');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isSuperAdmin() && token) {
      loadAdmins();
    }
  }, [isSuperAdmin, token, loadAdmins]);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      setLoading(true);
      setError(null);
      
      const newAdmin = await authApiService.createAdmin(token, createFormData);
      setAdmins(prev => [...prev, newAdmin]);
      
      // Reset form
      setCreateFormData({
        name: '',
        username: '',
        password: '',
        role: 1,
      });
      setShowCreateForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create admin');
    } finally {
      setLoading(false);
    }
  };

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
            Your current role: <strong>{getRoleName()}</strong>
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
          👥 Admin Management
        </h2>
        
        {error && (
          <div style={{
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '4px',
            padding: '15px',
            marginBottom: '20px',
            color: '#c33'
          }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            disabled={loading}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginRight: '10px'
            }}
          >
            {showCreateForm ? 'Cancel' : 'Create New Admin'}
          </button>
          
          <button
            onClick={loadAdmins}
            disabled={loading}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {/* Create Admin Form */}
        {showCreateForm && (
          <div style={{
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: '0 0 15px 0' }}>Create New Admin</h3>
            
            <form onSubmit={handleCreateAdmin}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Name:
                </label>
                <input
                  type="text"
                  value={createFormData.name}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Username:
                </label>
                <input
                  type="text"
                  value={createFormData.username}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, username: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Password:
                </label>
                <input
                  type="password"
                  value={createFormData.password}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Role:
                </label>
                <select
                  value={createFormData.role}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, role: parseInt(e.target.value) }))}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value={1}>Admin</option>
                  <option value={0}>Super Admin</option>
                </select>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Creating...' : 'Create Admin'}
              </button>
            </form>
          </div>
        )}

        {/* Admin List */}
        <div style={{
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '20px'
        }}>
          <h3 style={{ margin: '0 0 15px 0' }}>Admin Users</h3>
          
          {loading && admins.length === 0 ? (
            <p>Loading admins...</p>
          ) : admins.length === 0 ? (
            <p>No admins found.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#e9ecef' }}>
                    <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #dee2e6' }}>Name</th>
                    <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #dee2e6' }}>Username</th>
                    <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #dee2e6' }}>Role</th>
                    <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #dee2e6' }}>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((adminUser) => (
                    <tr key={adminUser.id}>
                      <td style={{ padding: '10px', border: '1px solid #dee2e6' }}>{adminUser.name}</td>
                      <td style={{ padding: '10px', border: '1px solid #dee2e6' }}>{adminUser.username}</td>
                      <td style={{ padding: '10px', border: '1px solid #dee2e6' }}>
                        <span style={{
                          backgroundColor: adminUser.role === 0 ? '#dc3545' : '#28a745',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          {adminUser.role === 0 ? 'Super Admin' : 'Admin'}
                        </span>
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #dee2e6' }}>
                        {new Date(adminUser.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminManagement;
