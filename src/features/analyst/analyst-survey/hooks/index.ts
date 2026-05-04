/**
 * High-Level Hooks (Facade Pattern)
 * 
 * These hooks provide simplified, high-level APIs for common use cases.
 * They wrap low-level api hooks (queries & mutations) for better DX.
 * 
 * For low-level control, import directly from '../api/queries' or '../api/mutations'
 */

// High-level facade hooks
export * from './use-survey-manager';
export * from './use-question-manager';
export * from './use-survey-detail';
