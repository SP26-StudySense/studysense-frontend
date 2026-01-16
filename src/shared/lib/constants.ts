/**
 * Application-wide constants
 */

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

// Session constants
export const SESSION = {
  MIN_DURATION_MINUTES: 5,
  MAX_DURATION_MINUTES: 480, // 8 hours
  DEFAULT_DURATION_MINUTES: 60,
  AUTO_PAUSE_IDLE_MINUTES: 15,
} as const;

// Study Plan constants
export const STUDY_PLAN = {
  MAX_DAILY_HOURS: 12,
  MIN_DAILY_HOURS: 0.5,
  DEFAULT_DAILY_HOURS: 2,
} as const;

// API constants
export const API = {
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,
  CACHE_TIME_MS: 5 * 60 * 1000, // 5 minutes
  STALE_TIME_MS: 60 * 1000, // 1 minute
} as const;

// Storage keys
export const STORAGE_KEYS = {
  THEME: 'studysense-theme',
  SIDEBAR_COLLAPSED: 'studysense-sidebar-collapsed',
  RECENT_SEARCHES: 'studysense-recent-searches',
  ONBOARDING_COMPLETED: 'studysense-onboarding-completed',
} as const;

// Breakpoints (matching Tailwind)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

// Animation durations (in ms)
export const ANIMATION = {
  FAST: 150,
  NORMAL: 200,
  SLOW: 300,
  VERY_SLOW: 500,
} as const;

// Validation rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
  NAME_MAX_LENGTH: 100,
  EMAIL_MAX_LENGTH: 255,
  BIO_MAX_LENGTH: 500,
  TITLE_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: 2000,
} as const;

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM d, yyyy',
  DISPLAY_WITH_TIME: 'MMM d, yyyy h:mm a',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  INPUT: 'yyyy-MM-dd',
  TIME: 'h:mm a',
} as const;
