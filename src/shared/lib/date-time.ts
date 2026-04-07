function isDateOnly(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
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
  if (!value) {
    return 'N/A';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
