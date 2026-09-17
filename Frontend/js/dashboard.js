//dashboard.js — ExpenseFlow

import { requireUser } from "./modules/authGuard.js";
import {
  getUser,
  saveUser,
  getSettings,
  getTransactions,
  createTransaction,
} from "./modules/storage.js";
import { applyDarkMode } from "./modules/darkmode.js";
import { formatCurrencyFull } from "./modules/currency.js";
import { formatDate, getCurrentMonthLabel } from "./modules/dateutils.js";
import { getCategoryConfig } from "./modules/categories.js";

// Backstop only — the real guard is the blocking inline script in <head>.
requireUser();

// STATE

let transactions = [];
let selectedType = null;

// DOM ELEMENTS

const balanceEl = document.getElementById("balance");
const totalIncomeEl = document.getElementById("total-income");
const totalExpensesEl = document.getElementById("total-expenses");
const budgetWarningEl = document.getElementById("budget-warning");
const welcomeMsgEl = document.getElementById("welcome-msg");
const amountInput = document.getElementById("amount");
const categorySelect = document.getElementById("category");
const dateInput = document.getElementById("date");
const descriptionInput = document.getElementById("description");
const addTransactionBtn = document.getElementById("transaction-button");
const incomeBtn = document.querySelector(".income-btn");
const expenseBtn = document.querySelector(".expense-btn");

// LOAD USER PROFILE
// Sets avatar and welcome message
//user is still cached in localStorage, not fetched.

function loadUserProfile() {
  const user = getUser();
  if (!user) return;

  const avatarImg = document.getElementById("header-avatar");
  if (avatarImg && user.avatar) {
    avatarImg.src = user.avatar;
  }

  if (welcomeMsgEl) {
    if (user.isNew) {
      welcomeMsgEl.textContent = `Welcome, ${user.firstName} 👋`;
      user.isNew = false;
      saveUser(user);
    } else {
      welcomeMsgEl.textContent = `Welcome back, ${user.firstName} 👋`;
    }
  }
}

// CURRENT MONTH

function setCurrentMonth() {
  const el = document.getElementById("current-month");
  if (el) el.textContent = getCurrentMonthLabel();
}

// BUDGET CHECK
// Now async (getSettings fetches from the API). Field name fixed:
// backend stores `monthlyBudget`, not `budget`.

async function checkBudget(totalExpenses) {
  const settings = await getSettings();
  if (!settings || !budgetWarningEl) {
    if (budgetWarningEl) budgetWarningEl.classList.add("hidden");
    return;
  }
  const budget = parseFloat(settings.monthlyBudget);
  budgetWarningEl.classList.toggle(
    "hidden",
    !(budget > 0 && totalExpenses > budget),
  );
}

// CALCULATE TOTALS
// Unchanged — pure math over the in-memory `transactions` array.

function calculateTotals() {
  let totalIncome = 0;
  let totalExpenses = 0;
  transactions.forEach((tx) => {
    if (tx.type === "income") totalIncome += tx.amount;
    else if (tx.type === "expense") totalExpenses += tx.amount;
  });
  return { totalIncome, totalExpenses, balance: totalIncome - totalExpenses };
}

// UPDATE DASHBOARD
// Now async because it awaits checkBudget.

async function updateDashboard() {
  const totals = calculateTotals();
  balanceEl.textContent = formatCurrencyFull(totals.balance);
  totalIncomeEl.textContent = formatCurrencyFull(totals.totalIncome);
  totalExpensesEl.textContent = formatCurrencyFull(totals.totalExpenses);
  await checkBudget(totals.totalExpenses);
}

// TITLE CASE

function toTitleCase(str) {
  if (!str) return "";
  return str.replace(
    /\w\S*/g,
    (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
  );
}

// RENDER ONE TRANSACTION
// Unchanged — just renders whatever transaction object it's given.

function renderTransaction(tx) {
  const cfg = getCategoryConfig(tx.type, tx.category);
  const description =
    tx.description && tx.description.trim()
      ? tx.description
      : tx.note && tx.note.trim()
        ? tx.note
        : toTitleCase(tx.category);

  const item = document.createElement("div");
  item.classList.add("transaction", tx.type);
  item.innerHTML = `
    <div class="transaction-info">
      <i class="fa-solid ${cfg.icon}" style="color:${cfg.color}; background-color:${cfg.bg};"></i>
      <div class="details">
        <p class="tx-title">${description}</p>
        <p class="tx-category">${cfg.label}</p>
        <p class="tx-date">${formatDate(tx.date)}</p>
      </div>
      <div class="activity-amount">
        <p>${tx.type === "income" ? "+" : "-"}${formatCurrencyFull(tx.amount)}</p>
      </div>
    </div>
  `;
  document.getElementById("activity-list").prepend(item);
}

// LOAD / PERSIST TRANSACTIONS

async function loadFromStorage() {
  transactions = await getTransactions();
  [...transactions].reverse().forEach((tx) => renderTransaction(tx));
}

// Was: push into local array + saveTransactions(wholeArray).
// Now: create just the one transaction on the backend, then use what
// comes back (includes Mongo's _id) as the object we keep locally.
async function addTransaction(transaction) {
  const created = await createTransaction(transaction);
  transactions.push(created);
  await updateDashboard();
  renderTransaction(created);
  clearForm();
}

// CLEAR FORM

function clearForm() {
  amountInput.value = "";
  categorySelect.value = "";
  dateInput.value = "";
  descriptionInput.value = "";
  selectedType = null;
  incomeBtn.classList.remove("active");
  expenseBtn.classList.remove("active");
}

// CATEGORY FILTER

function filterCategories(type) {
  const incomeGroup = document.getElementById("income-categories");
  const expenseGroup = document.getElementById("expense-categories");
  const select = document.getElementById("category");

  select.value = "";

  if (type === "income") {
    incomeGroup.classList.remove("hidden");
    expenseGroup.classList.add("hidden");
    Array.from(expenseGroup.options).forEach((o) => (o.disabled = true));
    Array.from(incomeGroup.options).forEach((o) => (o.disabled = false));
  } else {
    expenseGroup.classList.remove("hidden");
    incomeGroup.classList.add("hidden");
    Array.from(incomeGroup.options).forEach((o) => (o.disabled = true));
    Array.from(expenseGroup.options).forEach((o) => (o.disabled = false));
  }
}

// TYPE BUTTON EVENTS

incomeBtn.addEventListener("click", () => {
  selectedType = "income";
  incomeBtn.classList.add("active");
  expenseBtn.classList.remove("active");
  filterCategories("income");
});

expenseBtn.addEventListener("click", () => {
  selectedType = "expense";
  expenseBtn.classList.add("active");
  incomeBtn.classList.remove("active");
  filterCategories("expense");
});

// ADD TRANSACTION BUTTON
// Now async so we can await addTransaction(). Wrapped in try/catch so a
// failed request (network down, 401, validation error) shows up instead
// of failing silently.

addTransactionBtn.addEventListener("click", async () => {
  if (!selectedType) {
    alert("Please choose Income or Expense.");
    return;
  }
  const amountValue = parseFloat(amountInput.value);
  if (!amountInput.value || isNaN(amountValue) || amountValue <= 0) {
    alert("Please enter a valid amount greater than zero.");
    return;
  }
  if (!descriptionInput.value.trim()) {
    alert("Please add a description.");
    return;
  }
  if (!categorySelect.value) {
    alert("Please select a category.");
    return;
  }
  if (!dateInput.value) {
    alert("Please select a date.");
    return;
  }

  try {
    await addTransaction({
      amount: amountValue,
      type: selectedType,
      description: descriptionInput.value.trim(),
      category: categorySelect.value,
      date: dateInput.value,
    });
  } catch (err) {
    alert(`Could not save transaction: ${err.message}`);
  }
});

// INIT
// Wrapped in an async function so loadFromStorage() finishes (transactions
// populated) before updateDashboard() runs its totals.

async function init() {
  applyDarkMode();
  setCurrentMonth();
  loadUserProfile();
  await loadFromStorage();
  await updateDashboard();
}

init();
