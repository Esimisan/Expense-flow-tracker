
   /*index.js — ExpenseFlow Registration*/
  

const firstNameInput = document.getElementById('first-name');
const lastNameInput  = document.getElementById('last-name');
const emailInput     = document.getElementById('email');
const registerBtn    = document.getElementById('register-btn');


// VALIDATION HELPERS

function showError(inputEl, errorId) {
  inputEl.classList.add('error');
  document.getElementById(errorId).classList.remove('hidden');
}

function clearError(inputEl, errorId) {
  inputEl.classList.remove('error');
  document.getElementById(errorId).classList.add('hidden');
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


// REGISTER

registerBtn.addEventListener('click', () => {
  let valid = true;

  const firstName = firstNameInput.value.trim();
  const lastName  = lastNameInput.value.trim();
  const email     = emailInput.value.trim();

  // Validate first name
  if (!firstName) {
    showError(firstNameInput, 'err-first-name');
    valid = false;
  } else {
    clearError(firstNameInput, 'err-first-name');
  }

  // Validate last name
  if (!lastName) {
    showError(lastNameInput, 'err-last-name');
    valid = false;
  } else {
    clearError(lastNameInput, 'err-last-name');
  }

  // Validate email
  if (!email || !isValidEmail(email)) {
    showError(emailInput, 'err-email');
    valid = false;
  } else {
    clearError(emailInput, 'err-email');
  }

  if (!valid) return;

  // Save user to localStorage (no password stored)
  const user = {
    firstName,
    lastName,
    email,
    avatar: '/images/Property 1=04.png',
    isNew: true
  };

  localStorage.setItem('expenseflow_user', JSON.stringify(user));

  // Redirect to dashboard
  window.location.replace('dashboard.html');
});

// Clear error styling on input
[firstNameInput, lastNameInput, emailInput].forEach(input => {
  input.addEventListener('input', () => {
    const errId = 'err-' + input.id;
    if (document.getElementById(errId)) {
      clearError(input, errId);
    }
  });
});