/**
 * Analyst Survey Module Barrel Export
 * Feature-Based Module Structure with Clean API Layer
 * 
 * This module uses:
 * - api/ - Low-level API layer (types, pure functions, queries, mutations)
 * - hooks/ - High-level facade hooks (simplified APIs)
 * - components/ - Shared UI components
 * - SurveyList - Survey list page component
 * - SurveyDetail - Survey detail page component
 * 
 * PATTERN: Auth-style architecture
 * - Low-level: api/queries.ts, api/mutations.ts (primitives)
 * - High-level: hooks/use-survey-manager.ts, hooks/use-question-manager.ts (facades)
 */

// ==================== API Module (Low-Level) ====================
// Pure API functions, primitive query/mutation hooks
export * from './api';

// ==================== Facade Hooks (High-Level) ====================
// Convenient high-level hooks wrapping api layer
export * from './hooks/';

// ==================== Shared Components ====================
export * from './components';

// ==================== Feature Pages ====================
export * from './SurveyList';
export * from './SurveyDetail';

// // ==================== Legacy Types (Use api/types instead) ====================
// // These types are duplicates from old architecture
// export * from './types';
