function isDateOnly(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
}

type DateLikeInput = string | number | Date | null | undefined;

interface UserDateTimeOptions {
  locale?: string;
  timeZone?: string;
  fallback?: string;
}

function resolveLocale(locale?: string): string {
  if (locale) {
    return locale;
  }

  if (typeof navigator !== 'undefined' && navigator.language) {
    return navigator.language;
  }

  return 'en-US';
}

function isIsoDateTimeWithoutTimeZone(value: string): boolean {
  const trimmed = value.trim();

  // Example matches:
  // 2026-04-07T19:43
  // 2026-04-07T19:43:21
  // 2026-04-07T19:43:21.583233
  // Does NOT match strings already ending with Z or +/-hh:mm.
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,7})?)?$/.test(trimmed);
}

function toValidDate(value: DateLikeInput): Date | null {
  if (value == null || value === '') {
    return null;
  }

  let normalizedValue: string | number | Date = value;

  if (typeof value === 'string' && isIsoDateTimeWithoutTimeZone(value)) {
    // Backend may return UTC datetime without timezone suffix.
    // Force UTC parsing to avoid local-time interpretation drift.
    normalizedValue = `${value}Z`;
  }

  const parsed = normalizedValue instanceof Date ? normalizedValue : new Date(normalizedValue);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

export function getUserTimeZone(fallback: string = 'UTC'): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || fallback;
  } catch {
    return fallback;
  }
}

export function formatDateInUserTimeZone(
  value: DateLikeInput,
  options: UserDateTimeOptions = {}
): string {
  const { locale, timeZone, fallback = 'N/A' } = options;
  const date = toValidDate(value);

  if (!date) {
    return fallback;
  }

  return new Intl.DateTimeFormat(resolveLocale(locale), {
    timeZone: timeZone || getUserTimeZone(),
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function formatDateTimeInUserTimeZone(
  value: DateLikeInput,
  options: UserDateTimeOptions = {}
): string {
  const { locale, timeZone, fallback = 'N/A' } = options;
  const date = toValidDate(value);

  if (!date) {
    return fallback;
  }

  return new Intl.DateTimeFormat(resolveLocale(locale), {
    timeZone: timeZone || getUserTimeZone(),
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatDateTimeHmDdMmYyyyInUserTimeZone(
  value: DateLikeInput,
  options: UserDateTimeOptions = {}
): string {
  const { locale, timeZone, fallback = 'N/A' } = options;
  const date = toValidDate(value);

  if (!date) {
    return fallback;
  }

  const parts = new Intl.DateTimeFormat(resolveLocale(locale), {
    timeZone: timeZone || getUserTimeZone(),
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const getPart = (type: Intl.DateTimeFormatPartTypes): string => {
    return parts.find((part) => part.type === type)?.value ?? '';
  };

  const hh = getPart('hour');
  const mm = getPart('minute');
  const dd = getPart('day');
  const month = getPart('month');
  const yyyy = getPart('year');

  if (!hh || !mm || !dd || !month || !yyyy) {
    return fallback;
  }

  return `${hh}:${mm} ${dd}/${month}/${yyyy}`;
}

export function getTodayLocalDateInput(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function toLocalDateInputValue(value?: string): string {
  if (!value) {
    return '';
  }

  if (isDateOnly(value)) {
    return value;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function localDateInputToUtcIso(localDate: string): string {
  return `${localDate}T00:00:00Z`;
}

export function isLocalDateBeforeToday(localDate: string): boolean {
  if (!localDate) {
    return false;
  }

  const date = new Date(`${localDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return date.getTime() < today.getTime();
}

export function isIsoDateBeforeTodayLocal(isoDate?: string): boolean {
  if (!isoDate) {
    return false;
  }

  const localInput = toLocalDateInputValue(isoDate);
  return isLocalDateBeforeToday(localInput);
}

export function formatLocalDate(value?: string): string {
  return formatDateInUserTimeZone(value, { fallback: value || 'N/A' });
}
