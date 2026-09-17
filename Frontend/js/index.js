//index.js — ExpenseFlow Registration

import { saveUser, saveToken, registerUser } from "./modules/storage.js";
import { redirectIfLoggedIn } from "./modules/authGuard.js";

// Backstop only — the head's inline script already redirects logged-in
// users to the dashboard before this module ever runs.
redirectIfLoggedIn();

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirm-password");
const registerBtn = document.getElementById("register-btn");
const formErrorEl = document.getElementById("err-form");

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

function showFormError(message) {
  formErrorEl.textContent = message;
  formErrorEl.classList.remove("hidden");
}

function clearFormError() {
  formErrorEl.textContent = "";
  formErrorEl.classList.add("hidden");
}

// REGISTER

registerBtn.addEventListener("click", async () => {
  let valid = true;
  clearFormError();

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  if (!name) {
    showError(nameInput, "err-name");
    valid = false;
  } else {
    clearError(nameInput, "err-name");
  }

  if (!email || !isValidEmail(email)) {
    showError(emailInput, "err-email");
    valid = false;
  } else {
    clearError(emailInput, "err-email");
  }

  if (!password || password.length < 6) {
    showError(passwordInput, "err-password");
    valid = false;
  } else {
    clearError(passwordInput, "err-password");
  }

  if (!confirmPassword || confirmPassword !== password) {
    showError(confirmPasswordInput, "err-confirm-password");
    valid = false;
  } else {
    clearError(confirmPasswordInput, "err-confirm-password");
  }

  if (!valid) return;

  registerBtn.disabled = true;
  registerBtn.textContent = "Creating account...";

  try {
    // confirmPassword is never sent — it's a client-side-only check.
    const response = await registerUser({ name, email, password });

    saveUser({
      _id: response._id,
      name: response.name,
      email: response.email,
      avatar: "images/Property 1=04.png",
      isNew: true,
    });
    saveToken(response.token);

    window.location.replace("dashboard.html");
  } catch (err) {
    showFormError(err.message || "Registration failed. Please try again.");
    registerBtn.disabled = false;
    registerBtn.innerHTML =
      'Get Started <i class="fa-solid fa-arrow-right"></i>';
  }
});

// Clear error styling on input
[nameInput, emailInput, passwordInput, confirmPasswordInput].forEach(
  (input) => {
    input.addEventListener("input", () => {
      const errId = "err-" + input.id;
      if (document.getElementById(errId)) {
        clearError(input, errId);
      }
    });
  },
);
