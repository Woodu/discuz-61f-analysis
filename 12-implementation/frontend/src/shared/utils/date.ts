import { format, formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export function formatDate(
  date: Date | string,
  formatStr = 'yyyy-MM-dd HH:mm'
): string {
  return format(new Date(date), formatStr, { locale: zhCN });
}

export function formatRelativeTime(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { locale: zhCN, addSuffix: true });
}
