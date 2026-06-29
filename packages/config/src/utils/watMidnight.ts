import { WAT_OFFSET_MS } from '../constants';

export function getWatMidnight(date: Date = new Date()): Date {
  const utcMs = date.getTime() + (date.getTimezoneOffset() * 60000);
  const watMs = utcMs + WAT_OFFSET_MS;
  const watDate = new Date(watMs);
  
  watDate.setUTCHours(23, 59, 59, 999);
  
  const targetUtcMs = watDate.getTime() - WAT_OFFSET_MS;
  return new Date(targetUtcMs);
}
