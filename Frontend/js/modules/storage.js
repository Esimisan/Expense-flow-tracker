//storage.js — ExpenseFlow

const KEYS = {
  USER: "expenseflow_user",
  TOKEN: "expenseflow_token",
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

// -----Token -----

export function getToken() {
  return localStorage.getItem(KEYS.TOKEN);
}

export function saveToken(token) {
  localStorage.setItem(KEYS.TOKEN, token);
}

export function removeToken() {
  localStorage.removeItem(KEYS.TOKEN);
}

// Decodes the token's payload (no signature check, that's the server's job via jwt.verify in the protect middleware) and compares its exp claim against the current time. Used for client-side UX only, not security.
export function isTokenExpired(token) {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expiryMs = payload.exp * 1000; // exp is in seconds, Date.now() is ms
    return Date.now() >= expiryMs;
  } catch {
    // Malformed token — treat as expired
    return true;
  }
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
