import assert from "node:assert/strict";

const TIMEZONE_IST = "Asia/Kolkata";
const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;

function getISTDetails(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE_IST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const partMap = {};
  for (const part of parts) {
    partMap[part.type] = part.value;
  }

  const year = parseInt(partMap.year, 10);
  const month = parseInt(partMap.month, 10);
  const day = parseInt(partMap.day, 10);
  let hour = parseInt(partMap.hour, 10);
  if (hour === 24) hour = 0;
  const minute = parseInt(partMap.minute, 10);
  const second = parseInt(partMap.second, 10);

  const dateString = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return { year, month, day, hour, minute, second, dateString };
}

function getISTDayBounds(dateStringIST) {
  const [yearStr, monthStr, dayStr] = dateStringIST.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);

  const midnightUtcTimestamp = Date.UTC(year, month, day, 0, 0, 0, 0) - IST_OFFSET_MS;
  const startUtc = new Date(midnightUtcTimestamp);
  const endUtc = new Date(midnightUtcTimestamp + 24 * 60 * 60 * 1000 - 1);

  return { startUtc, endUtc };
}

function getActive3HourSlotIST(date = new Date()) {
  const hour = getISTDetails(date).hour;
  if (hour < 9 || hour > 21) {
    return -1;
  }
  return Math.floor(hour / 3) * 3;
}

console.log("=== Running Asia/Kolkata (IST) Timezone Tests ===");

// 1. Test Fixed Midnight Rollover:
// 2026-09-05 00:00:00 IST is 2026-09-04 18:30:00 UTC
const midnightIST_UTC = new Date("2026-09-04T18:30:00.000Z");
const detailsMidnight = getISTDetails(midnightIST_UTC);
console.log("1. Midnight IST Test:", detailsMidnight.dateString, `${detailsMidnight.hour}:${detailsMidnight.minute}`);
assert.equal(detailsMidnight.dateString, "2026-09-05", "Should be 2026-09-05 in IST");
assert.equal(detailsMidnight.hour, 0, "Hour should be 00 at midnight IST");
assert.equal(detailsMidnight.minute, 0, "Minute should be 00 at midnight IST");
console.log("   ✓ Midnight rollover correctly identifies new IST day");

// 2. Test 1 Minute before Midnight IST:
// 2026-09-04 23:59:00 IST is 2026-09-04 18:29:00 UTC
const beforeMidnight = new Date("2026-09-04T18:29:00.000Z");
const detailsBefore = getISTDetails(beforeMidnight);
console.log("2. 1-Minute Before Midnight IST Test:", detailsBefore.dateString, `${detailsBefore.hour}:${detailsBefore.minute}`);
assert.equal(detailsBefore.dateString, "2026-09-04", "Should still be 2026-09-04 in IST");
assert.equal(detailsBefore.hour, 23, "Hour should be 23");
assert.equal(detailsBefore.minute, 59, "Minute should be 59");

console.log("   ✓ Boundary before midnight retains previous IST date");

// 3. Test Day Bounds UTC Conversion:
const bounds = getISTDayBounds("2026-09-05");
console.log("3. IST Day Bounds for 2026-09-05:");
console.log("   Start UTC:", bounds.startUtc.toISOString());
console.log("   End UTC:  ", bounds.endUtc.toISOString());
assert.equal(bounds.startUtc.toISOString(), "2026-09-04T18:30:00.000Z");
assert.equal(bounds.endUtc.toISOString(), "2026-09-05T18:29:59.999Z");
console.log("   ✓ Day bounds match exact 24-hour UTC window for Asia/Kolkata");

// 4. Test Active Hours and 3-Hour Interval Slots:
const slot9 = getActive3HourSlotIST(new Date("2026-09-05T04:00:00.000Z")); // 09:30 IST
assert.equal(slot9, 9, "09:30 IST should be in slot 9");

const slot12 = getActive3HourSlotIST(new Date("2026-09-05T07:15:00.000Z")); // 12:45 IST
assert.equal(slot12, 12, "12:45 IST should be in slot 12");

const slot15 = getActive3HourSlotIST(new Date("2026-09-05T10:00:00.000Z")); // 15:30 IST
assert.equal(slot15, 15, "15:30 IST should be in slot 15");

const slot18 = getActive3HourSlotIST(new Date("2026-09-05T13:00:00.000Z")); // 18:30 IST
assert.equal(slot18, 18, "18:30 IST should be in slot 18");

const slot21 = getActive3HourSlotIST(new Date("2026-09-05T15:45:00.000Z")); // 21:15 IST
assert.equal(slot21, 21, "21:15 IST should be in slot 21");

// Test Night Hours (outside reasonable hours)
const nightLate = getActive3HourSlotIST(new Date("2026-09-05T17:30:00.000Z")); // 23:00 IST
assert.equal(nightLate, -1, "23:00 IST should be outside active hours");

const nightEarly = getActive3HourSlotIST(new Date("2026-09-05T00:30:00.000Z")); // 06:00 IST
assert.equal(nightEarly, -1, "06:00 IST should be outside active hours");

console.log("4. 3-Hour Interval Slots (9, 12, 15, 18, 21) & Night Muting:");
console.log("   ✓ 09:30 IST -> Slot 9");
console.log("   ✓ 12:45 IST -> Slot 12");
console.log("   ✓ 15:30 IST -> Slot 15");
console.log("   ✓ 18:30 IST -> Slot 18");
console.log("   ✓ 21:15 IST -> Slot 21");
console.log("   ✓ 23:00 IST & 06:00 IST -> Muted (-1, outside active hours)");

console.log("\n=== ALL IST TIMEZONE TESTS PASSED ===");
