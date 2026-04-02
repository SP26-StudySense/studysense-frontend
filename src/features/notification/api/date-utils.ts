import { formatDistanceToNow } from 'date-fns';

const TIMEZONE_SUFFIX_REGEX = /(?:[zZ]|[+-]\d{2}:?\d{2})$/;

export function parseNotificationDate(value: string | Date): Date {
  if (value instanceof Date) return value;

  const raw = value.trim();
  if (!raw) return new Date(Number.NaN);

  const normalized = raw.includes('T') ? raw : raw.replace(' ', 'T');
  const timestamp = TIMEZONE_SUFFIX_REGEX.test(normalized)
    ? normalized
    : `${normalized}Z`;

  return new Date(timestamp);
}

export function toNotificationTimestamp(value: string | Date): number {
  const timestamp = parseNotificationDate(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export function formatNotificationDistance(value: string | Date): string {
  const date = parseNotificationDate(value);
  if (Number.isNaN(date.getTime())) return 'Unknown time';
  return formatDistanceToNow(date, { addSuffix: true });
}