// User Management Types and Interfaces for Admin Dashboard

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  college: string;
  address: string;
  isVerified: boolean;
  isActive: boolean;
  stepOneComplete: boolean;
  stepTwoComplete: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetUsersResponse {
  users: User[];
  pagination: PaginationInfo;
}

export interface GetUsersQuery {
  page?: number;
  limit?: number;
  verified?: boolean;
  active?: boolean;
  search?: string;
}

export interface DeactivateUserRequest {
  reason?: string;
}

export interface UserActionResponse {
  message: string;
  user: {
    id: string;
    username: string;
    email: string;
    fullName: string;
    isActive: boolean;
  };
}

export interface UserFilters {
  verified: boolean | null;
  active: boolean | null;
  search: string;
}

export interface UserTableColumn {
  key: keyof User | 'actions';
  label: string;
  sortable?: boolean;
  width?: string;
}

export type UserStatus = 'active-verified' | 'active-unverified' | 'inactive' | 'incomplete';

export interface UserStatusInfo {
  status: UserStatus;
  label: string;
  color: string;
  backgroundColor: string;
}

export interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

export interface DeactivationModalProps {
  isOpen: boolean;
  user: User | null;
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
}

export interface UserDetailsModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
}

export interface ApiError {
  message: string;
  error: string;
  statusCode: number;
}

export interface UserManagementState {
  users: User[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo;
  filters: UserFilters;
  selectedUser: User | null;
  showDeactivationModal: boolean;
  showReactivationModal: boolean;
  showUserDetailsModal: boolean;
}

// Utility types for form handling
export interface UserFormData {
  username: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  college: string;
  address: string;
}

// Export const for user registration steps
export const RegistrationStep = {
  INCOMPLETE: 0,
  STEP_ONE_COMPLETE: 1,
  STEP_TWO_COMPLETE: 2,
  FULLY_REGISTERED: 3
} as const;

export type RegistrationStepType = typeof RegistrationStep[keyof typeof RegistrationStep];

// Helper type for status badge props
export interface StatusBadgeProps {
  user: User;
  size?: 'small' | 'medium' | 'large';
}

// Table action types
export type UserAction = 'view' | 'activate' | 'deactivate' | 'details';

export interface UserActionConfig {
  action: UserAction;
  label: string;
  icon: string;
  disabled?: (user: User) => boolean;
  dangerous?: boolean;
}
