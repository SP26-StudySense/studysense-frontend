/**
 * Common shared types used across the application
 */

// Base entity with common fields
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// User roles matching Backend
export enum UserRole {
  USER = 'User',
  ADMIN = 'Admin',
  SYSTEM = 'System',
}

// Common status types
export enum Status {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  PENDING = 'Pending',
  COMPLETED = 'Completed',
  ARCHIVED = 'Archived',
}

// Study session status
export enum SessionStatus {
  NOT_STARTED = 'NotStarted',
  IN_PROGRESS = 'InProgress',
  PAUSED = 'Paused',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

// Study event types (matching Backend StudyEvent)
export enum StudyEventType {
  SESSION_START = 'SessionStart',
  SESSION_PAUSE = 'SessionPause',
  SESSION_RESUME = 'SessionResume',
  SESSION_END = 'SessionEnd',
  TASK_START = 'TaskStart',
  TASK_COMPLETE = 'TaskComplete',
  TASK_SKIP = 'TaskSkip',
  FEEDBACK_SUBMITTED = 'FeedbackSubmitted',
}

// Difficulty levels
export enum DifficultyLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
  EXPERT = 'Expert',
}

// Select option type
export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

// Navigation item
export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  disabled?: boolean;
  badge?: string | number;
  children?: NavItem[];
}

// Breadcrumb item
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

// Table column definition
export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, row: T) => React.ReactNode;
}

// Form field error
export interface FieldError {
  field: string;
  message: string;
}

// Toast notification
export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

// Modal state
export interface ModalState<T = unknown> {
  isOpen: boolean;
  data?: T;
}

// Confirmation dialog
export interface ConfirmationDialog {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}
