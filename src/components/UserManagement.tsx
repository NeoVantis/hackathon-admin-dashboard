import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { userApiService } from '../services/userApi';
import type {
  User,
  UserStatusInfo,
  UserManagementState
} from '../types/user';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Eye, UserX, UserCheck, Search } from 'lucide-react';

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

  // Load users on component mount and when dependencies change
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const renderStatusBadge = (user: User) => {
    const status = getUserStatus(user);
    return (
      <Badge 
        variant="secondary"
        style={{ 
          backgroundColor: status.backgroundColor, 
          color: status.color 
        }}
      >
        {status.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          Manage hackathon participants and their accounts
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter users by status and search criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name or email..."
                  value={state.filters.search}
                  onChange={(e) => setState(prev => ({
                    ...prev,
                    filters: { ...prev.filters, search: e.target.value }
                  }))}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="verified">Verification Status</Label>
              <Select
                value={state.filters.verified === null ? "all" : state.filters.verified.toString()}
                onValueChange={(value) => setState(prev => ({
                  ...prev,
                  filters: { 
                    ...prev.filters, 
                    verified: value === "all" ? null : value === "true"
                  }
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Verified</SelectItem>
                  <SelectItem value="false">Unverified</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="active">Account Status</Label>
              <Select
                value={state.filters.active === null ? "all" : state.filters.active.toString()}
                onValueChange={(value) => setState(prev => ({
                  ...prev,
                  filters: { 
                    ...prev.filters, 
                    active: value === "all" ? null : value === "true"
                  }
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={loadUsers} disabled={state.loading}>
              {state.loading ? "Loading..." : "Apply Filters"}
            </Button>
            <Button 
              variant="outline"
              onClick={() => setState(prev => ({
                ...prev,
                filters: { verified: null, active: null, search: '' }
              }))}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {state.error && (
        <div className="flex items-center gap-2 p-4 text-red-600 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="h-4 w-4" />
          <span>{state.error}</span>
        </div>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({state.pagination.total})</CardTitle>
          <CardDescription>
            Page {state.pagination.page} of {state.pagination.totalPages}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {state.loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registration</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.fullName}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{renderStatusBadge(user)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setState(prev => ({
                            ...prev,
                            selectedUser: user,
                            showUserDetailsModal: true
                          }))}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {user.isActive ? (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setState(prev => ({
                              ...prev,
                              selectedUser: user,
                              showDeactivationModal: true
                            }))}
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => setState(prev => ({
                              ...prev,
                              selectedUser: user,
                              showReactivationModal: true
                            }))}
                          >
                            <UserCheck className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {state.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="outline"
                disabled={state.pagination.page === 1}
                onClick={() => setState(prev => ({
                  ...prev,
                  pagination: { ...prev.pagination, page: prev.pagination.page - 1 }
                }))}
              >
                Previous
              </Button>
              
              <span className="text-sm text-muted-foreground">
                Page {state.pagination.page} of {state.pagination.totalPages}
              </span>
              
              <Button
                variant="outline"
                disabled={state.pagination.page === state.pagination.totalPages}
                onClick={() => setState(prev => ({
                  ...prev,
                  pagination: { ...prev.pagination, page: prev.pagination.page + 1 }
                }))}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deactivation Modal */}
      <Dialog 
        open={state.showDeactivationModal} 
        onOpenChange={(open) => setState(prev => ({ ...prev, showDeactivationModal: open }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate User</DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate {state.selectedUser?.fullName}?
              This action can be reversed later.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (optional)</Label>
            <Input
              id="reason"
              placeholder="Enter reason for deactivation..."
              value={deactivationReason}
              onChange={(e) => setDeactivationReason(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setState(prev => ({ ...prev, showDeactivationModal: false }))}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeactivateUser}
              disabled={state.loading}
            >
              {state.loading ? "Deactivating..." : "Deactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reactivation Modal */}
      <Dialog 
        open={state.showReactivationModal} 
        onOpenChange={(open) => setState(prev => ({ ...prev, showReactivationModal: open }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reactivate User</DialogTitle>
            <DialogDescription>
              Are you sure you want to reactivate {state.selectedUser?.fullName}?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setState(prev => ({ ...prev, showReactivationModal: false }))}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleReactivateUser}
              disabled={state.loading}
            >
              {state.loading ? "Reactivating..." : "Reactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Details Modal */}
      <Dialog 
        open={state.showUserDetailsModal} 
        onOpenChange={(open) => setState(prev => ({ ...prev, showUserDetailsModal: open }))}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Complete information for {state.selectedUser?.fullName}
            </DialogDescription>
          </DialogHeader>

          {state.selectedUser && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                  <p className="text-sm">{state.selectedUser.fullName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <p className="text-sm">{state.selectedUser.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <div className="mt-1">{renderStatusBadge(state.selectedUser)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Registration Date</Label>
                  <p className="text-sm">{formatDate(state.selectedUser.createdAt)}</p>
                </div>
              </div>

              {/* Registration Progress */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Registration Progress</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${state.selectedUser.stepOneComplete ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm">Step 1 Complete</span>
                    {state.selectedUser.stepOneComplete && <span className="text-xs text-green-600">✓</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${state.selectedUser.stepTwoComplete ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm">Step 2 Complete</span>
                    {state.selectedUser.stepTwoComplete && <span className="text-xs text-green-600">✓</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${state.selectedUser.isVerified ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm">Email Verified</span>
                    {state.selectedUser.isVerified && <span className="text-xs text-green-600">✓</span>}
                  </div>
                </div>
              </div>

              {/* Account Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">User ID</Label>
                  <p className="text-xs font-mono bg-muted p-2 rounded">{state.selectedUser.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                  <p className="text-sm">{formatDate(state.selectedUser.updatedAt)}</p>
                </div>
              </div>

              {/* Additional User Information */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Username</Label>
                  <p className="text-sm">{state.selectedUser.username}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Phone Number</Label>
                  <p className="text-sm">{state.selectedUser.phoneNumber || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">College</Label>
                  <p className="text-sm">{state.selectedUser.college || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                  <p className="text-sm">{state.selectedUser.address || 'Not provided'}</p>
                </div>
                {state.selectedUser.deletedAt && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Deleted At</Label>
                    <p className="text-sm text-red-600">{formatDate(state.selectedUser.deletedAt)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setState(prev => ({ ...prev, showUserDetailsModal: false }))}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
