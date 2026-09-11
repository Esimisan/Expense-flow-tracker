//settings.js — ExpenseFlow

import { requireUser } from "./modules/authGuard.js";
import {
  getUser,
  saveUser,
  getSettings,
  saveSettings as persistSettings,
  removeUser,
  removeTransactions,
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

function loadProfile() {
  const user = getUser();
  profileName.textContent = `${user.firstName} ${user.lastName}`;
  profileEmail.textContent = user.email;

  if (user.avatar) {
    profileAvatar.src = user.avatar;
    avatarOptions.forEach((opt) => {
      opt.classList.toggle("selected", opt.dataset.src === user.avatar);
    });
  }
}

// LOAD SAVED SETTINGS

function loadSettings() {
  const settings = getSettings();
  if (!settings) return;

  if (settings.currency) {
    currencySelect.value = settings.currency;
    updateBudgetSymbol(settings.currency);
  }
  if (settings.budget) budgetInput.value = settings.budget;
  if (settings.darkMode) darkModeToggle.checked = true;
}

// Update the currency symbol next to the budget input
function updateBudgetSymbol(currencyCode) {
  const symbolEl = document.querySelector(".budget-symbol");
  if (symbolEl) symbolEl.textContent = CURRENCY_SYMBOLS[currencyCode] || "₦";
}

// SAVE SETTINGS
// Called whenever any preference changes

function saveSettings() {
  persistSettings({
    currency: currencySelect.value,
    budget: budgetInput.value,
    darkMode: darkModeToggle.checked,
  });
}

// AVATAR PICKER TOGGLE

changeAvatarBtn.addEventListener("click", () => {
  avatarPicker.classList.toggle("hidden");
});

// SELECT AVATAR

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
  // Apply immediately on the settings page itself
  document.body.classList.toggle("dark-mode", darkModeToggle.checked);
});

// Budget saves on blur (when user leaves the field)
budgetInput.addEventListener("blur", saveSettings);
budgetInput.addEventListener("change", saveSettings);

// SIGN OUT
// Clears user record and redirects to index

signOutBtn.addEventListener("click", () => {
  const confirmed = confirm("Are you sure you want to sign out?");
  if (!confirmed) return;

  removeUser();
  window.location.replace("index.html");
});

// CLEAR ALL DATA
// Wipes all transactions but keeps user account

clearBtn.addEventListener("click", () => {
  const confirmed = confirm(
    "This will permanently delete all your transactions and reset your balance to zero. This cannot be undone.\n\nContinue?",
  );
  if (!confirmed) return;

  removeTransactions();
  alert("All data has been cleared.");
});

// INIT

applyDarkMode();
loadProfile();
loadSettings();
