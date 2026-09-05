/**
 * Asia/Kolkata (IST, UTC+05:30) Timezone Utilities
 *
 * All business day boundaries, today/tomorrow dates, and notification
 * scheduling MUST use Asia/Kolkata, regardless of server host timezone.
 * India does not observe Daylight Saving Time (DST); offset is fixed at UTC+05:30.
 */

export const TIMEZONE_IST = "Asia/Kolkata";
export const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000; // 5 hours 30 mins in ms

// Reusable singleton formatters to prevent costly re-instantiation
const istPartsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIMEZONE_IST,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

const istDisplayFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIMEZONE_IST,
  weekday: "short",
  month: "short",
  day: "numeric",
});

const istTimeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIMEZONE_IST,
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

const istMonthDayFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIMEZONE_IST,
  month: "short",
  day: "numeric",
});

export interface ISTTimeDetails {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  hour: number; // 0-23
  minute: number; // 0-59
  second: number; // 0-59
  dateString: string; // "YYYY-MM-DD"
  formattedDisplay: string; // e.g. "Sat, Sep 5"
}

/**
 * Returns breakdown of the specified Date (or now) in Asia/Kolkata timezone.
 */
export function getISTDetails(date: Date = new Date()): ISTTimeDetails {
  const parts = istPartsFormatter.formatToParts(date);
  const partMap: Record<string, string> = {};
  for (const part of parts) {
    partMap[part.type] = part.value;
  }

  const year = parseInt(partMap.year, 10);
  const month = parseInt(partMap.month, 10);
  const day = parseInt(partMap.day, 10);
  let hour = parseInt(partMap.hour, 10);
  // Handle edge case where 24:00 is returned by some ICU formatters
  if (hour === 24) hour = 0;
  const minute = parseInt(partMap.minute, 10);
  const second = parseInt(partMap.second, 10);

  const dateString = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const formattedDisplay = istDisplayFormatter.format(date);

  return {
    year,
    month,
    day,
    hour,
    minute,
    second,
    dateString,
    formattedDisplay,
  };
}

/**
 * Returns "YYYY-MM-DD" in Asia/Kolkata for the given Date (or now).
 */
export function getISTDateString(date: Date = new Date()): string {
  return getISTDetails(date).dateString;
}

/**
 * Returns current hour (0-23) in Asia/Kolkata.
 */
export function getISTHour(date: Date = new Date()): number {
  return getISTDetails(date).hour;
}

/**
 * Returns the exact UTC Date bounds for an entire calendar day in Asia/Kolkata.
 * 00:00:00.000 IST -> 23:59:59.999 IST
 *
 * @param dateStringIST "YYYY-MM-DD" in IST
 */
export function getISTDayBounds(dateStringIST: string): { startUtc: Date; endUtc: Date } {
  const [yearStr, monthStr, dayStr] = dateStringIST.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1; // 0-indexed
  const day = parseInt(dayStr, 10);

  // Midnight IST in UTC:
  // Date.UTC(year, month, day, 0, 0, 0, 0) is midnight UTC.
  // Midnight IST happens 5 hours 30 mins BEFORE midnight UTC.
  const midnightUtcTimestamp = Date.UTC(year, month, day, 0, 0, 0, 0) - IST_OFFSET_MS;
  const startUtc = new Date(midnightUtcTimestamp);

  // End of IST day is 23:59:59.999 IST, which is startUtc + 24 hours - 1 ms
  const endUtc = new Date(midnightUtcTimestamp + 24 * 60 * 60 * 1000 - 1);

  return { startUtc, endUtc };
}

/**
 * Checks if current IST time falls within active hours.
 * Default: 09:00 to 21:00 IST (inclusive).
 */
export function isWithinActiveHoursIST(
  startHour = 9,
  endHour = 21,
  date: Date = new Date()
): boolean {
  const hour = getISTHour(date);
  return hour >= startHour && hour <= endHour;
}

/**
 * Returns the 3-hour slot for the current IST hour.
 * Supported slots: 9, 12, 15, 18, 21.
 * Returns -1 if outside active hours.
 */
export function getActive3HourSlotIST(date: Date = new Date()): number {
  const hour = getISTHour(date);
  if (hour < 9 || hour > 21) {
    return -1;
  }
  // Floor to nearest 3-hour interval (9, 12, 15, 18, 21)
  return Math.floor(hour / 3) * 3;
}

/**
 * Formats a Date or ISO string into a localized, friendly IST timestamp.
 * Examples:
 * - "Today at 9:00 AM"
 * - "Yesterday at 3:15 PM"
 * - "Sep 4, 11:30 AM"
 */
export function formatISTNotificationTime(input: Date | string): string {
  const date = typeof input === "string" ? new Date(input) : input;
  const inputDetails = getISTDetails(date);
  const nowDetails = getISTDetails(new Date());

  const timeStr = istTimeFormatter.format(date);

  // Compare date strings YYYY-MM-DD
  if (inputDetails.dateString === nowDetails.dateString) {
    return `Today at ${timeStr}`;
  }

  // Calculate yesterday in IST
  const yesterdayDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const yesterdayDetails = getISTDetails(yesterdayDate);
  if (inputDetails.dateString === yesterdayDetails.dateString) {
    return `Yesterday at ${timeStr}`;
  }

  const monthName = istMonthDayFormatter.format(date);

  return `${monthName}, ${timeStr}`;
}

/**
 * Returns date category label for grouping notification logs in IST:
 * "Today", "Yesterday", or formatted "Wed, Sep 4"
 */
export function getISTDateCategory(input: Date | string): string {
  const date = typeof input === "string" ? new Date(input) : input;
  const inputDetails = getISTDetails(date);
  const nowDetails = getISTDetails(new Date());

  if (inputDetails.dateString === nowDetails.dateString) {
    return "Today";
  }

  const yesterdayDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const yesterdayDetails = getISTDetails(yesterdayDate);
  if (inputDetails.dateString === yesterdayDetails.dateString) {
    return "Yesterday";
  }

  return inputDetails.formattedDisplay;
}
