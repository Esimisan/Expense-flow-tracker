//dateUtils.js — ExpenseFlow

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MONTH_NAMES_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// "2026-03-05" -> "Mar 5, 2026"
export function formatDate(dateString) {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${MONTH_NAMES_SHORT[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
}

// Today's month/year for the dashboard header, e.g. "March, 2026"
export function getCurrentMonthLabel() {
  const now = new Date();
  return `${MONTH_NAMES[now.getMonth()]}, ${now.getFullYear()}`;
}

// Every distinct "YYYY-MM" present in a list of transactions, plus the
// current month, sorted newest first — used to populate the month dropdown.
export function getAvailableMonths(transactions) {
  const set = new Set();
  const now = new Date();
  set.add(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
  );
  transactions.forEach((tx) => {
    if (tx.date) set.add(tx.date.substring(0, 7));
  });
  return [...set].sort((a, b) => b.localeCompare(a));
}

// "2026-03" -> "March" (or "March 2025" if it isn't the current year)
export function monthYMToLabel(ym) {
  const [year, month] = ym.split("-");
  const now = new Date();
  const label = MONTH_NAMES[parseInt(month, 10) - 1];
  return parseInt(year, 10) === now.getFullYear() ? label : `${label} ${year}`;
}
