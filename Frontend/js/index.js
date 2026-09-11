//index.js — ExpenseFlow Registration

import { saveUser } from "./modules/storage.js";
import { redirectIfLoggedIn } from "./modules/authGuard.js";

// Backstop only — the head's inline script already redirects logged-in
// users to the dashboard before this module ever runs.
redirectIfLoggedIn();

const firstNameInput = document.getElementById("first-name");
const lastNameInput = document.getElementById("last-name");
const emailInput = document.getElementById("email");
const registerBtn = document.getElementById("register-btn");

// VALIDATION HELPERS

function showError(inputEl, errorId) {
  inputEl.classList.add("error");
  document.getElementById(errorId).classList.remove("hidden");
}

function clearError(inputEl, errorId) {
  inputEl.classList.remove("error");
  document.getElementById(errorId).classList.add("hidden");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// REGISTER

registerBtn.addEventListener("click", () => {
  let valid = true;

  const firstName = firstNameInput.value.trim();
  const lastName = lastNameInput.value.trim();
  const email = emailInput.value.trim();

  if (!firstName) {
    showError(firstNameInput, "err-first-name");
    valid = false;
  } else {
    clearError(firstNameInput, "err-first-name");
  }

  if (!lastName) {
    showError(lastNameInput, "err-last-name");
    valid = false;
  } else {
    clearError(lastNameInput, "err-last-name");
  }

  if (!email || !isValidEmail(email)) {
    showError(emailInput, "err-email");
    valid = false;
  } else {
    clearError(emailInput, "err-email");
  }

  if (!valid) return;

  saveUser({
    firstName,
    lastName,
    email,
    avatar: "images/Property 1=04.png",
    isNew: true,
  });

  window.location.replace("dashboard.html");
});

// Clear error styling on input
[firstNameInput, lastNameInput, emailInput].forEach((input) => {
  input.addEventListener("input", () => {
    const errId = "err-" + input.id;
    if (document.getElementById(errId)) {
      clearError(input, errId);
    }
  });
});
