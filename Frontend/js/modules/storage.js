//storage.js — ExpenseFlow

const KEYS = {
  USER: "expenseflow_user",
  TRANSACTIONS: "expenseflow_transactions",
  SETTINGS: "expenseflow_settings",
};

// ---- User ----

export function getUser() {
  const raw = localStorage.getItem(KEYS.USER);
  return raw ? JSON.parse(raw) : null;
}

export function saveUser(user) {
  localStorage.setItem(KEYS.USER, JSON.stringify(user));
}

export function removeUser() {
  localStorage.removeItem(KEYS.USER);
}

// ---- Transactions ----

export function getTransactions() {
  const raw = localStorage.getItem(KEYS.TRANSACTIONS);
  return raw ? JSON.parse(raw) : [];
}

export function saveTransactions(transactions) {
  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
}

export function removeTransactions() {
  localStorage.removeItem(KEYS.TRANSACTIONS);
}

// ---- Settings ----

export function getSettings() {
  const raw = localStorage.getItem(KEYS.SETTINGS);
  return raw ? JSON.parse(raw) : null;
}

export function saveSettings(settings) {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}
