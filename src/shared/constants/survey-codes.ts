/**
 * Survey codes constants
 * Mirror of backend: SSS.Domain.Constants.SurveyCodes
 */
export const SURVEY_CODES = {
  LEARNING_BEHAVIOR: 'LEARNING_BEHAVIOR',
  LEARNING_TARGET: 'LEARNING_TARGET',
  ROADMAP_LEARNING_TARGET: 'ROADMAP_LEARNING_TARGET',
  POST_MODULE_FEEDBACK: 'POST_MODULE_FEEDBACK',
} as const;

export type SurveyCode = (typeof SURVEY_CODES)[keyof typeof SURVEY_CODES];
