/* ================================
   settings.js — ExpenseFlow
   ================================ */

// =====================
// AUTH GUARD
// =====================
const rawUser = localStorage.getItem('expenseflow_user');
if (!rawUser) window.location.replace('index.html');

// =====================
// DOM REFS
// =====================
const profileAvatar    = document.getElementById('profile-avatar');
const profileName      = document.getElementById('profile-name');
const profileEmail     = document.getElementById('profile-email');
const changeAvatarBtn  = document.getElementById('change-avatar-btn');
const avatarPicker     = document.getElementById('avatar-picker');
const avatarOptions    = document.querySelectorAll('.avatar-option');
const currencySelect   = document.getElementById('currency-select');
const budgetInput      = document.getElementById('budget-input');
const darkModeToggle   = document.getElementById('dark-mode-toggle');
const signOutBtn       = document.getElementById('sign-out-btn');
const clearBtn         = document.getElementById('clear-btn');

// =====================
// APPLY DARK MODE
// =====================
function applyDarkMode() {
  const raw = localStorage.getItem('expenseflow_settings');
  if (!raw) return;
  const settings = JSON.parse(raw);
  if (settings.darkMode) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
}

// =====================
// LOAD USER PROFILE
// =====================
function loadProfile() {
  const user = JSON.parse(localStorage.getItem('expenseflow_user'));
  profileName.textContent  = `${user.firstName} ${user.lastName}`;
  profileEmail.textContent = user.email;

  if (user.avatar) {
    profileAvatar.src = user.avatar;
    // Mark matching avatar option as selected
    avatarOptions.forEach(opt => {
      opt.classList.toggle('selected', opt.dataset.src === user.avatar);
    });
  }
}

// =====================
// LOAD SAVED SETTINGS
// =====================
function loadSettings() {
  const raw = localStorage.getItem('expenseflow_settings');
  if (!raw) return;
  const settings = JSON.parse(raw);

  if (settings.currency) {
    currencySelect.value = settings.currency;
    updateBudgetSymbol(settings.currency);
  }
  if (settings.budget)   budgetInput.value    = settings.budget;
  if (settings.darkMode) darkModeToggle.checked = true;
}

// Update the ₦ symbol next to the budget input
function updateBudgetSymbol(currencyCode) {
  const symbols = {
    AED:'د.إ', AFN:'؋', ALL:'L', AMD:'֏', ARS:'$', AUD:'A$', AZN:'₼',
    BAM:'KM', BDT:'৳', BGN:'лв', BHD:'.د.ب', BND:'B$', BOB:'Bs.', BRL:'R$',
    BWP:'P', BYN:'Br', BZD:'BZ$', CAD:'C$', CHF:'Fr', CLP:'$', CNY:'¥',
    COP:'$', CRC:'₡', CZK:'Kč', DKK:'kr', DOP:'RD$', DZD:'دج', EGP:'£',
    ETB:'Br', EUR:'€', GBP:'£', GEL:'₾', GHS:'₵', GTQ:'Q', HKD:'HK$',
    HNL:'L', HRK:'kn', HUF:'Ft', IDR:'Rp', ILS:'₪', INR:'₹', IQD:'ع.د',
    IRR:'﷼', ISK:'kr', JMD:'J$', JOD:'JD', JPY:'¥', KES:'KSh', KGS:'лв',
    KHR:'៛', KRW:'₩', KWD:'KD', KZT:'₸', LBP:'£', LKR:'₨', LYD:'LD',
    MAD:'MAD', MDL:'L', MMK:'K', MUR:'₨', MXN:'$', MYR:'RM', MZN:'MT',
    NAD:'N$', NGN:'₦', NOK:'kr', NPR:'₨', NZD:'NZ$', OMR:'﷼', PAB:'B/.',
    PEN:'S/', PHP:'₱', PKR:'₨', PLN:'zł', QAR:'﷼', RON:'lei', RSD:'din',
    RUB:'₽', SAR:'﷼', SEK:'kr', SGD:'S$', THB:'฿', TND:'DT', TRY:'₺',
    TWD:'NT$', TZS:'TSh', UAH:'₴', UGX:'USh', USD:'$', UYU:'$U', UZS:'лв',
    VES:'Bs.S', VND:'₫', XAF:'FCFA', XOF:'CFA', YER:'﷼', ZAR:'R', ZMW:'ZK'
  };
  const symbolEl = document.querySelector('.budget-symbol');
  if (symbolEl) symbolEl.textContent = symbols[currencyCode] || '₦';
}

// =====================
// SAVE SETTINGS
// Called whenever any preference changes
// =====================
function saveSettings() {
  const settings = {
    currency: currencySelect.value,
    budget:   budgetInput.value,
    darkMode: darkModeToggle.checked
  };
  localStorage.setItem('expenseflow_settings', JSON.stringify(settings));
}

// =====================
// AVATAR PICKER TOGGLE
// =====================
changeAvatarBtn.addEventListener('click', () => {
  avatarPicker.classList.toggle('hidden');
});

// =====================
// SELECT AVATAR
// =====================
avatarOptions.forEach(opt => {
  opt.addEventListener('click', () => {
    const src = opt.dataset.src;

    // Update displayed avatar
    profileAvatar.src = src;

    // Mark as selected
    avatarOptions.forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');

    // Save to user object
    const user = JSON.parse(localStorage.getItem('expenseflow_user'));
    user.avatar = src;
    localStorage.setItem('expenseflow_user', JSON.stringify(user));

    // Close picker
    avatarPicker.classList.add('hidden');
  });
});

// =====================
// PREFERENCES — auto-save on change
// =====================
currencySelect.addEventListener('change', () => {
  saveSettings();
  updateBudgetSymbol(currencySelect.value);
});
darkModeToggle.addEventListener('change', () => {
  saveSettings();
  // Apply immediately on the settings page itself
  if (darkModeToggle.checked) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
});

// Budget saves on blur (when user leaves the field)
budgetInput.addEventListener('blur',   saveSettings);
budgetInput.addEventListener('change', saveSettings);

// =====================
// SIGN OUT
// Clears user record and redirects to index
// =====================
signOutBtn.addEventListener('click', () => {
  const confirmed = confirm('Are you sure you want to sign out?');
  if (!confirmed) return;

  localStorage.removeItem('expenseflow_user');
  window.location.replace('index.html');
});

// =====================
// CLEAR ALL DATA
// Wipes all transactions but keeps user account
// =====================
clearBtn.addEventListener('click', () => {
  const confirmed = confirm(
    'This will permanently delete all your transactions and reset your balance to zero. This cannot be undone.\n\nContinue?'
  );
  if (!confirmed) return;

  localStorage.removeItem('expenseflow_transactions');
  alert('All data has been cleared.');
});

// =====================
// INIT
// =====================
applyDarkMode();
loadProfile();
loadSettings();