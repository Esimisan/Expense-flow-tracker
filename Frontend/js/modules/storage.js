//storage.js — ExpenseFlow

import API from "./api.js";

const KEYS = {
  USER: "expenseflow_user",
  TOKEN: "expenseflow_token",
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

// ---- Token ----

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

// ---- Shared fetch helper ----
// Instead of repeating the same code for adding the Authorization header and checking if the response is OK in every request, put the logic in one place. Then each function only needs to say what to fetch, not worry about how to fetch it.

async function apiRequest(url, options = {}) {
  const token = getToken();

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(
      data?.message || `Request failed with status ${res.status}`,
    );
  }

  return data;
}

// ---- Auth ----

export async function registerUser({ name, email, password }) {
  return apiRequest(API.auth.register, {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export async function loginUser({ email, password }) {
  return apiRequest(API.auth.login, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// ---- Transactions ----
// One function per backend route now, instead of "get the array / save the
// array" — matches the CRUD routes in transactionController.js directly.

export async function getTransactions() {
  const data = await apiRequest(API.transactions.base, { method: "GET" });
  return data.transactions;
}

export async function createTransaction(transaction) {
  return apiRequest(API.transactions.base, {
    method: "POST",
    body: JSON.stringify(transaction),
  });
}

export async function updateTransaction(id, updates) {
  return apiRequest(API.transactions.byId(id), {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

export async function deleteTransaction(id) {
  return apiRequest(API.transactions.byId(id), { method: "DELETE" });
}

// ---- Settings ----

export async function getSettings() {
  const data = await apiRequest(API.settings.base, { method: "GET" });
  return data.settings;
}

export async function updateSettings(settings) {
  const { budget, ...rest } = settings;
  const payload = {
    ...rest,
    ...(budget !== undefined ? { monthlyBudget: budget } : {}),
  };

  return apiRequest(API.settings.base, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
