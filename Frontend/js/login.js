//login.js — ExpenseFlow Login

import { saveUser, saveToken, loginUser } from "./modules/storage.js";
import { redirectIfLoggedIn } from "./modules/authguard.js";

redirectIfLoggedIn();

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("login-btn");
const formErrorEl = document.getElementById("err-form");

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

loginBtn.addEventListener("click", async () => {
  let valid = true;
  clearFormError();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !isValidEmail(email)) {
    showError(emailInput, "err-email");
    valid = false;
  } else {
    clearError(emailInput, "err-email");
  }

  if (!password) {
    showError(passwordInput, "err-password");
    valid = false;
  } else {
    clearError(passwordInput, "err-password");
  }

  if (!valid) return;

  loginBtn.disabled = true;
  loginBtn.textContent = "Signing in...";

  try {
    const response = await loginUser({ email, password });

    // Login doesn't return avatar/isNew — those are register-only concepts
    // on this backend. Fall back to a default avatar if none is cached
    // locally from a previous session on this browser.
    saveUser({
      _id: response._id,
      name: response.name,
      email: response.email,
      avatar: "images/Property 1=04.png",
      isNew: false,
    });
    saveToken(response.token);

    window.location.replace("dashboard.html");
  } catch (err) {
    showFormError(err.message || "Invalid email or password.");
    loginBtn.disabled = false;
    loginBtn.innerHTML = 'Sign In <i class="fa-solid fa-arrow-right"></i>';
  }
});

[emailInput, passwordInput].forEach((input) => {
  input.addEventListener("input", () => {
    const errId = "err-" + input.id;
    if (document.getElementById(errId)) {
      clearError(input, errId);
    }
  });
});
