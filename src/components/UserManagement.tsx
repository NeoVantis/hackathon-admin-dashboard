import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { userApiService } from '../services/userApi';
import type {
  User,
  UserFilters,
  UserStatusInfo,
  UserManagementState
} from '../types/user';

const UserManagement: React.FC = () => {
  const { token } = useAuth();
  
  const [state, setState] = useState<UserManagementState>({
    users: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0
    },
    filters: {
      verified: null,
      active: null,
      search: ''
    },
    selectedUser: null,
    showDeactivationModal: false,
    showReactivationModal: false,
    showUserDetailsModal: false
  });

  const [deactivationReason, setDeactivationReason] = useState('');

  /**
   * Get user status information for badge display
   */
  const getUserStatus = (user: User): UserStatusInfo => {
    if (!user.isActive) {
      return {
        status: 'inactive',
        label: 'Inactive',
        color: '#ffffff',
        backgroundColor: '#dc3545'
      };
    }
    
    if (!user.stepOneComplete || !user.stepTwoComplete) {
      return {
        status: 'incomplete',
        label: 'Incomplete',
        color: '#ffffff',
        backgroundColor: '#6c757d'
      };
    }
    
    if (user.isVerified) {
      return {
        status: 'active-verified',
        label: 'Active & Verified',
        color: '#ffffff',
        backgroundColor: '#28a745'
      };
    }
    
    return {
      status: 'active-unverified',
      label: 'Active (Unverified)',
      color: '#000000',
      backgroundColor: '#ffc107'
    };
  };

  /**
   * Load users with current filters and pagination
   */
  const loadUsers = useCallback(async () => {
    if (!token) return;
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const query = {
        page: state.pagination.page,
        limit: state.pagination.limit,
        ...(state.filters.verified !== null && { verified: state.filters.verified }),
        ...(state.filters.active !== null && { active: state.filters.active }),
        ...(state.filters.search && { search: state.filters.search })
      };

      const response = await userApiService.getAllUsers(token, query);
      
      setState(prev => ({
        ...prev,
        users: response.users,
        pagination: response.pagination,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load users',
        loading: false
      }));
    }
  }, [token, state.pagination.page, state.pagination.limit, state.filters]);

  /**
   * Handle user deactivation
   */
  const handleDeactivateUser = async () => {
    if (!token || !state.selectedUser) return;

    try {
      setState(prev => ({ ...prev, loading: true }));
      
      await userApiService.deactivateUser(
        token, 
        state.selectedUser.id, 
        deactivationReason.trim() || undefined
      );
      
      setState(prev => ({
        ...prev,
        showDeactivationModal: false,
        selectedUser: null,
        loading: false
      }));
      
      setDeactivationReason('');
      await loadUsers();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to deactivate user',
        loading: false
      }));
    }
  };

  /**
   * Handle user reactivation
   */
  const handleReactivateUser = async () => {
    if (!token || !state.selectedUser) return;

    try {
      setState(prev => ({ ...prev, loading: true }));
      
      await userApiService.reactivateUser(token, state.selectedUser.id);
      
      setState(prev => ({
        ...prev,
        showReactivationModal: false,
        selectedUser: null,
        loading: false
      }));
      
      await loadUsers();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to reactivate user',
        loading: false
      }));
    }
  };

  /**
   * Handle filter changes
   */
  const handleFilterChange = (newFilters: Partial<UserFilters>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters },
      pagination: { ...prev.pagination, page: 1 } // Reset to first page
    }));
  };

  /**
   * Handle pagination changes
   */
  const handlePageChange = (page: number) => {
    setState(prev => ({
      ...prev,
      pagination: { ...prev.pagination, page }
    }));
  };

  /**
   * Handle page size changes
   */
  const handlePageSizeChange = (limit: number) => {
    setState(prev => ({
      ...prev,
      pagination: { ...prev.pagination, limit, page: 1 }
    }));
  };

  /**
   * Open deactivation modal
   */
  const openDeactivationModal = (user: User) => {
    setState(prev => ({
      ...prev,
      selectedUser: user,
      showDeactivationModal: true
    }));
  };

  /**
   * Open reactivation modal
   */
  const openReactivationModal = (user: User) => {
    setState(prev => ({
      ...prev,
      selectedUser: user,
      showReactivationModal: true
    }));
  };

  /**
   * Open user details modal
   */
  const openUserDetailsModal = (user: User) => {
    setState(prev => ({
      ...prev,
      selectedUser: user,
      showUserDetailsModal: true
    }));
  };

  /**
   * Close all modals
   */
  const closeModals = () => {
    setState(prev => ({
      ...prev,
      selectedUser: null,
      showDeactivationModal: false,
      showReactivationModal: false,
      showUserDetailsModal: false
    }));
    setDeactivationReason('');
  };

  // Load users when component mounts or dependencies change
  useEffect(() => {
    if (token) {
      loadUsers();
    }
  }, [token, loadUsers]);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#333' }}>
          👥 User Management
        </h2>
        
        {/* Error Display */}
        {state.error && (
          <div style={{
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '4px',
            padding: '15px',
            marginBottom: '20px',
            color: '#c33'
          }}>
            {state.error}
            <button
              onClick={() => setState(prev => ({ ...prev, error: null }))}
              style={{
                float: 'right',
                background: 'none',
                border: 'none',
                color: '#c33',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Filters and Controls */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '15px',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          {/* Search */}
          <div style={{ flex: '1', minWidth: '200px' }}>
            <input
              type="text"
              placeholder="Search by username or email..."
              value={state.filters.search}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Verification Filter */}
          <div>
            <select
              value={state.filters.verified === null ? '' : state.filters.verified.toString()}
              onChange={(e) => handleFilterChange({ 
                verified: e.target.value === '' ? null : e.target.value === 'true' 
              })}
              style={{
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            >
              <option value="">All Verification</option>
              <option value="true">Verified</option>
              <option value="false">Unverified</option>
            </select>
          </div>

          {/* Active Filter */}
          <div>
            <select
              value={state.filters.active === null ? '' : state.filters.active.toString()}
              onChange={(e) => handleFilterChange({ 
                active: e.target.value === '' ? null : e.target.value === 'true' 
              })}
              style={{
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={loadUsers}
            disabled={state.loading}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: state.loading ? 'not-allowed' : 'pointer'
            }}
          >
            {state.loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {/* Page Size Selector */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ marginRight: '10px' }}>Show:</label>
          <select
            value={state.pagination.limit}
            onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
            style={{
              padding: '4px 8px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span style={{ marginLeft: '10px', color: '#666' }}>
            users per page
          </span>
        </div>
      </div>

      {/* Users Table */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {state.loading && state.users.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>🔄</div>
            <p>Loading users...</p>
          </div>
        ) : state.users.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>👤</div>
            <p>No users found.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>
                    User Info
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>
                    Contact
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>
                    Registration
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>
                    Status
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {state.users.map((user) => {
                  const statusInfo = getUserStatus(user);
                  return (
                    <tr key={user.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                      {/* User Info */}
                      <td style={{ padding: '12px' }}>
                        <div>
                          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                            {user.fullName}
                          </div>
                          <div style={{ color: '#666', fontSize: '14px' }}>
                            @{user.username}
                          </div>
                          <div style={{ color: '#666', fontSize: '12px', marginTop: '2px' }}>
                            ID: {user.id.substring(0, 8)}...
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td style={{ padding: '12px' }}>
                        <div style={{ marginBottom: '4px' }}>
                          {user.email}
                        </div>
                        <div style={{ color: '#666', fontSize: '14px' }}>
                          {user.phoneNumber}
                        </div>
                        <div style={{ color: '#666', fontSize: '12px', marginTop: '2px' }}>
                          {user.college}
                        </div>
                      </td>

                      {/* Registration */}
                      <td style={{ padding: '12px' }}>
                        <div style={{ marginBottom: '4px' }}>
                          <span style={{
                            backgroundColor: user.stepOneComplete ? '#d4edda' : '#f8d7da',
                            color: user.stepOneComplete ? '#155724' : '#721c24',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            marginRight: '4px'
                          }}>
                            Step 1
                          </span>
                          <span style={{
                            backgroundColor: user.stepTwoComplete ? '#d4edda' : '#f8d7da',
                            color: user.stepTwoComplete ? '#155724' : '#721c24',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            Step 2
                          </span>
                        </div>
                        <div style={{ color: '#666', fontSize: '12px' }}>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          backgroundColor: statusInfo.backgroundColor,
                          color: statusInfo.color,
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {statusInfo.label}
                        </span>
                        {user.isVerified && (
                          <div style={{ 
                            color: '#28a745', 
                            fontSize: '12px', 
                            marginTop: '2px' 
                          }}>
                            ✓ Email Verified
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => openUserDetailsModal(user)}
                            style={{
                              backgroundColor: '#17a2b8',
                              color: 'white',
                              border: 'none',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            View
                          </button>
                          
                          {user.isActive ? (
                            <button
                              onClick={() => openDeactivationModal(user)}
                              disabled={state.loading}
                              style={{
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                cursor: state.loading ? 'not-allowed' : 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button
                              onClick={() => openReactivationModal(user)}
                              disabled={state.loading}
                              style={{
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                cursor: state.loading ? 'not-allowed' : 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              Reactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {state.pagination.totalPages > 1 && (
          <div style={{
            padding: '20px',
            borderTop: '1px solid #dee2e6',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ color: '#666' }}>
              Showing {((state.pagination.page - 1) * state.pagination.limit) + 1} to{' '}
              {Math.min(state.pagination.page * state.pagination.limit, state.pagination.total)} of{' '}
              {state.pagination.total} users
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handlePageChange(state.pagination.page - 1)}
                disabled={state.pagination.page <= 1 || state.loading}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  cursor: (state.pagination.page <= 1 || state.loading) ? 'not-allowed' : 'pointer'
                }}
              >
                Previous
              </button>
              
              <span style={{ 
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: '#f8f9fa'
              }}>
                Page {state.pagination.page} of {state.pagination.totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(state.pagination.page + 1)}
                disabled={state.pagination.page >= state.pagination.totalPages || state.loading}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  cursor: (state.pagination.page >= state.pagination.totalPages || state.loading) ? 'not-allowed' : 'pointer'
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Deactivation Modal */}
      {state.showDeactivationModal && state.selectedUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#dc3545' }}>
              Deactivate User Account
            </h3>
            <p style={{ margin: '0 0 16px 0' }}>
              Are you sure you want to deactivate the account for{' '}
              <strong>{state.selectedUser.fullName}</strong> (@{state.selectedUser.username})?
            </p>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Reason (optional):
              </label>
              <textarea
                value={deactivationReason}
                onChange={(e) => setDeactivationReason(e.target.value)}
                placeholder="Enter reason for deactivation..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                  resize: 'vertical'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={closeModals}
                disabled={state.loading}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  cursor: state.loading ? 'not-allowed' : 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivateUser}
                disabled={state.loading}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  cursor: state.loading ? 'not-allowed' : 'pointer'
                }}
              >
                {state.loading ? 'Deactivating...' : 'Deactivate User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reactivation Modal */}
      {state.showReactivationModal && state.selectedUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#28a745' }}>
              Reactivate User Account
            </h3>
            <p style={{ margin: '0 0 16px 0' }}>
              Are you sure you want to reactivate the account for{' '}
              <strong>{state.selectedUser.fullName}</strong> (@{state.selectedUser.username})?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={closeModals}
                disabled={state.loading}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  cursor: state.loading ? 'not-allowed' : 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleReactivateUser}
                disabled={state.loading}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  cursor: state.loading ? 'not-allowed' : 'pointer'
                }}
              >
                {state.loading ? 'Reactivating...' : 'Reactivate User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {state.showUserDetailsModal && state.selectedUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>
              User Details
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontWeight: 'bold', color: '#666' }}>Full Name:</label>
                <p style={{ margin: '4px 0 12px 0' }}>{state.selectedUser.fullName}</p>
              </div>
              
              <div>
                <label style={{ fontWeight: 'bold', color: '#666' }}>Username:</label>
                <p style={{ margin: '4px 0 12px 0' }}>@{state.selectedUser.username}</p>
              </div>
              
              <div>
                <label style={{ fontWeight: 'bold', color: '#666' }}>Email:</label>
                <p style={{ margin: '4px 0 12px 0' }}>{state.selectedUser.email}</p>
              </div>
              
              <div>
                <label style={{ fontWeight: 'bold', color: '#666' }}>Phone:</label>
                <p style={{ margin: '4px 0 12px 0' }}>{state.selectedUser.phoneNumber}</p>
              </div>
              
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontWeight: 'bold', color: '#666' }}>College/Institution:</label>
                <p style={{ margin: '4px 0 12px 0' }}>{state.selectedUser.college}</p>
              </div>
              
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontWeight: 'bold', color: '#666' }}>Address:</label>
                <p style={{ margin: '4px 0 12px 0' }}>{state.selectedUser.address}</p>
              </div>
              
              <div>
                <label style={{ fontWeight: 'bold', color: '#666' }}>Status:</label>
                <p style={{ margin: '4px 0 12px 0' }}>
                  <span style={{
                    backgroundColor: getUserStatus(state.selectedUser).backgroundColor,
                    color: getUserStatus(state.selectedUser).color,
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {getUserStatus(state.selectedUser).label}
                  </span>
                </p>
              </div>
              
              <div>
                <label style={{ fontWeight: 'bold', color: '#666' }}>Registration:</label>
                <p style={{ margin: '4px 0 12px 0' }}>
                  {new Date(state.selectedUser.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              
              <div>
                <label style={{ fontWeight: 'bold', color: '#666' }}>User ID:</label>
                <p style={{ 
                  margin: '4px 0 12px 0',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  wordBreak: 'break-all'
                }}>
                  {state.selectedUser.id}
                </p>
              </div>
            </div>
            
            <div style={{ 
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid #dee2e6',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={closeModals}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
