/**
 * Compatibility shim.
 * Canonical session hooks live in ../api/queries and ../api/mutations.
 */

export {
  useActiveSession,
  useSessionById,
  useSessionHistory,
  useRecentSessions,
  useSessionStatistics,
} from '../api/queries';

export {
  useStartSession,
  usePauseSession,
  useResumeSession,
  useEndSession,
  useLogEvent,
} from '../api/mutations';
