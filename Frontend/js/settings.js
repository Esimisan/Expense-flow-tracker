//settings.js — ExpenseFlow

import { requireUser } from "./modules/authguard.js";
import {
  getUser,
  saveUser,
  getSettings,
  updateSettings,
  removeUser,
  removeToken,
  getTransactions,
  deleteTransaction,
} from "./modules/storage.js";
import { applyDarkMode } from "./modules/darkmode.js";
import { CURRENCY_SYMBOLS } from "./modules/currency.js";

// Backstop only — the real guard is the blocking inline script in <head>.
requireUser();

// DOM REFS

const profileAvatar = document.getElementById("profile-avatar");
const profileName = document.getElementById("profile-name");
const profileEmail = document.getElementById("profile-email");
const changeAvatarBtn = document.getElementById("change-avatar-btn");
const avatarPicker = document.getElementById("avatar-picker");
const avatarOptions = document.querySelectorAll(".avatar-option");
const currencySelect = document.getElementById("currency-select");
const budgetInput = document.getElementById("budget-input");
const darkModeToggle = document.getElementById("dark-mode-toggle");
const signOutBtn = document.getElementById("sign-out-btn");
const clearBtn = document.getElementById("clear-btn");

// LOAD USER PROFILE
// Unchanged — user is still cached in localStorage.

function loadProfile() {
  const user = getUser();
  profileName.textContent = user.name;
  profileEmail.textContent = user.email;

  if (user.avatar) {
    profileAvatar.src = user.avatar;
    avatarOptions.forEach((opt) => {
      opt.classList.toggle("selected", opt.dataset.src === user.avatar);
    });
  }
}

// LOAD SAVED SETTINGS
// Now async. Reads `monthlyBudget` (the real backend field), not `budget`.

async function loadSettings() {
  const settings = await getSettings();
  if (!settings) return;

  if (settings.currency) {
    currencySelect.value = settings.currency;
    updateBudgetSymbol(settings.currency);
  }
  if (settings.monthlyBudget) budgetInput.value = settings.monthlyBudget;
  if (settings.darkMode) darkModeToggle.checked = true;
}

// Update the currency symbol next to the budget input

function updateBudgetSymbol(currencyCode) {
  const symbolEl = document.querySelector(".budget-symbol");
  if (symbolEl) symbolEl.textContent = CURRENCY_SYMBOLS[currencyCode] || "₦";
}

// SAVE SETTINGS
// Called whenever any preference changes. Now async — updateSettings()
// hits the API. Still sends `budget`; the remap to `monthlyBudget`
// happens inside storage.js so this file doesn't need to know about it.

async function saveSettings() {
  try {
    await updateSettings({
      currency: currencySelect.value,
      budget: budgetInput.value,
      darkMode: darkModeToggle.checked,
    });
  } catch (err) {
    alert(`Could not save settings: ${err.message}`);
  }
}

// AVATAR PICKER TOGGLE

changeAvatarBtn.addEventListener("click", () => {
  avatarPicker.classList.toggle("hidden");
});

// SELECT AVATAR
// Unchanged — avatar still lives on the user object, cached locally.

avatarOptions.forEach((opt) => {
  opt.addEventListener("click", () => {
    const src = opt.dataset.src;

    profileAvatar.src = src;

    avatarOptions.forEach((o) => o.classList.remove("selected"));
    opt.classList.add("selected");

    const user = getUser();
    user.avatar = src;
    saveUser(user);

    avatarPicker.classList.add("hidden");
  });
});

// PREFERENCES — auto-save on change

currencySelect.addEventListener("change", () => {
  saveSettings();
  updateBudgetSymbol(currencySelect.value);
});

darkModeToggle.addEventListener("change", () => {
  saveSettings();
  document.body.classList.toggle("dark-mode", darkModeToggle.checked);
});

budgetInput.addEventListener("blur", saveSettings);
budgetInput.addEventListener("change", saveSettings);

// SIGN OUT
// Unchanged — clears the local user/token pair, no backend call needed.

signOutBtn.addEventListener("click", () => {
  const confirmed = confirm("Are you sure you want to sign out?");
  if (!confirmed) return;

  removeUser();
  removeToken();
  window.location.replace("index.html");
});

// CLEAR ALL DATA
// No bulk-delete endpoint exists yet, so this fetches every transaction
// and deletes them one at a time. Fine for now; revisit with a dedicated
// backend route if this needs to handle large transaction counts.

clearBtn.addEventListener("click", async () => {
  const confirmed = confirm(
    "This will permanently delete all your transactions and reset your balance to zero. This cannot be undone.\n\nContinue?",
  );
  if (!confirmed) return;

  try {
    const transactions = await getTransactions();
    await Promise.all(transactions.map((tx) => deleteTransaction(tx._id)));
    alert("All data has been cleared.");
  } catch (err) {
    alert(`Could not clear data: ${err.message}`);
  }
});

// INIT
// Wrapped in an async function since loadSettings() now awaits the API.

async function init() {
  applyDarkMode();
  loadProfile();
  await loadSettings();
}

init();
