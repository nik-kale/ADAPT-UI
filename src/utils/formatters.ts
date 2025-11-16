import { format, formatDistance, parseISO } from 'date-fns';

export const formatTimestamp = (timestamp: string, formatStr = 'PPpp'): string => {
  try {
    return format(parseISO(timestamp), formatStr);
  } catch {
    return timestamp;
  }
};

export const formatRelativeTime = (timestamp: string): string => {
  try {
    return formatDistance(parseISO(timestamp), new Date(), { addSuffix: true });
  } catch {
    return timestamp;
  }
};

export const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
};

export const formatPercentage = (value: number, decimals = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
};
