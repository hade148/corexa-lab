import { format, parseISO, isValid } from 'date-fns';

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return dateStr;
    return format(date, 'dd/MM/yyyy');
  } catch {
    return dateStr;
  }
}

export function formatCurrency(amount: number): string {
  return '₪' + amount.toLocaleString('he-IL', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function formatNumber(amount: number): string {
  return amount.toLocaleString('he-IL');
}

export function isOverdue(dateStr: string): boolean {
  if (!dateStr) return false;
  try {
    const date = parseISO(dateStr);
    return isValid(date) && date < new Date();
  } catch {
    return false;
  }
}

export function isDueSoon(dateStr: string, daysAhead = 30): boolean {
  if (!dateStr) return false;
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return false;
    const now = new Date();
    const threshold = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
    return date >= now && date <= threshold;
  } catch {
    return false;
  }
}

export function toISODateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}
