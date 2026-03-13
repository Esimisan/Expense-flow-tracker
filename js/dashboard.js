/* ================================
   dashboard.js — ExpenseFlow
   ================================ */

// =====================
// AUTH GUARD
// =====================
const savedUser = localStorage.getItem('expenseflow_user');
if (!savedUser) {
  window.location.replace('index.html');
}

// =====================
// STATE
// =====================
let transactions = [];
let selectedType = null;

// =====================
// DOM ELEMENTS
// =====================
const balanceEl        = document.getElementById('balance');
const totalIncomeEl    = document.getElementById('total-income');
const totalExpensesEl  = document.getElementById('total-expenses');
const budgetWarningEl  = document.getElementById('budget-warning');
const welcomeMsgEl     = document.getElementById('welcome-msg');
const amountInput      = document.getElementById('amount');
const categorySelect   = document.getElementById('category');
const dateInput        = document.getElementById('date');
const noteInput        = document.getElementById('note');
const addTransactionBtn = document.getElementById('transaction-button');
const incomeBtn        = document.querySelector('.income-btn');
const expenseBtn       = document.querySelector('.expense-btn');


// =====================
// LOAD USER PROFILE
// Sets avatar, welcome message, and dark mode
// =====================
function loadUserProfile() {
  const raw = localStorage.getItem('expenseflow_user');
  if (!raw) return;
  const user = JSON.parse(raw);

  // Avatar
  const avatarImg = document.getElementById('header-avatar');
  if (avatarImg && user.avatar) {
    avatarImg.src = user.avatar;
  }

  // Welcome message
  if (welcomeMsgEl) {
    if (user.isNew) {
      welcomeMsgEl.textContent = `Welcome, ${user.firstName} 👋`;
      // After first visit, mark as returning
      user.isNew = false;
      localStorage.setItem('expenseflow_user', JSON.stringify(user));
    } else {
      welcomeMsgEl.textContent = `Welcome back, ${user.firstName} 👋`;
    }
  }
}


// =====================
// DARK MODE
// Reads saved setting and applies body class
// =====================
function applyDarkMode() {
  const rawSettings = localStorage.getItem('expenseflow_settings');
  if (!rawSettings) return;
  const settings = JSON.parse(rawSettings);
  if (settings.darkMode) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
}


// =====================
// CURRENT MONTH
// =====================
function setCurrentMonth() {
  const el = document.getElementById('current-month');
  if (!el) return;
  const now = new Date();
  const months = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];
  el.textContent = `${months[now.getMonth()]}, ${now.getFullYear()}`;
}


// =====================
// BUDGET CHECK
// =====================
function checkBudget(totalExpenses) {
  const rawSettings = localStorage.getItem('expenseflow_settings');
  if (!rawSettings || !budgetWarningEl) {
    if (budgetWarningEl) budgetWarningEl.classList.add('hidden');
    return;
  }
  const settings = JSON.parse(rawSettings);
  const budget = parseFloat(settings.budget);

  if (budget > 0 && totalExpenses > budget) {
    budgetWarningEl.classList.remove('hidden');
  } else {
    budgetWarningEl.classList.add('hidden');
  }
}


// =====================
// CALCULATE TOTALS
// =====================
function calculateTotals() {
  let totalIncome   = 0;
  let totalExpenses = 0;
  transactions.forEach(tx => {
    if (tx.type === 'income')       totalIncome   += tx.amount;
    else if (tx.type === 'expense') totalExpenses += tx.amount;
  });
  return { totalIncome, totalExpenses, balance: totalIncome - totalExpenses };
}


// =====================
// CURRENCY SYMBOL
// =====================
const CURRENCY_SYMBOLS = {
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

function getCurrencySymbol() {
  const raw = localStorage.getItem('expenseflow_settings');
  if (!raw) return '₦';
  const settings = JSON.parse(raw);
  return CURRENCY_SYMBOLS[settings.currency] || '₦';
}

// =====================
// FORMAT CURRENCY
// =====================
function fmt(n) {
  const symbol = getCurrencySymbol();
  return `${symbol}${n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}


// =====================
// UPDATE DASHBOARD
// =====================
function updateDashboard() {
  const totals = calculateTotals();
  balanceEl.textContent       = fmt(totals.balance);
  totalIncomeEl.textContent   = fmt(totals.totalIncome);
  totalExpensesEl.textContent = fmt(totals.totalExpenses);
  checkBudget(totals.totalExpenses);
}


// =====================
// GET ICON FOR CATEGORY
// =====================
function getIconForCategory(category) {
  const icons = {
    'salary':            'fa-briefcase',
    'food & dining':     'fa-utensils',
    'rent':              'fa-building',
    'transport':         'fa-bus',
    'shopping':          'fa-shopping-cart',
    'healthcare':        'fa-heart-pulse',
    'bills & utilities': 'fa-file-invoice',
    'entertainment':     'fa-film',
    'freelance':         'fa-laptop-code'
  };
  return icons[category] || 'fa-circle';
}


// =====================
// FORMAT DATE
// =====================
function formatDate(dateString) {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun',
                  'Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
}


// =====================
// RENDER ONE TRANSACTION
// =====================
function renderTransaction(tx) {
  const item = document.createElement('div');
  item.classList.add('transaction', tx.type);
  item.innerHTML = `
    <div class="transaction-info">
      <i class="fa-solid ${tx.icon}"></i>
      <div class="details">
        <p class="category">${tx.category}</p>
        <p class="date">${formatDate(tx.date)}</p>
        ${tx.note ? `<p class="note">${tx.note}</p>` : ''}
      </div>
      <div class="activity-amount">
        <p>${tx.type === 'income' ? '+' : '-'}${fmt(tx.amount)}</p>
      </div>
    </div>
  `;
  document.getElementById('activity-list').prepend(item);
}


// =====================
// LOCAL STORAGE
// =====================
function saveToStorage() {
  localStorage.setItem('expenseflow_transactions', JSON.stringify(transactions));
}

function loadFromStorage() {
  const saved = localStorage.getItem('expenseflow_transactions');
  if (saved) {
    transactions = JSON.parse(saved);
    [...transactions].reverse().forEach(tx => renderTransaction(tx));
  }
}


// =====================
// ADD TRANSACTION
// =====================
function addTransaction(transaction) {
  transactions.push(transaction);
  saveToStorage();
  updateDashboard();
  renderTransaction(transaction);
  clearForm();
}


// =====================
// CLEAR FORM
// =====================
function clearForm() {
  amountInput.value    = '';
  categorySelect.value = '';
  dateInput.value      = '';
  noteInput.value      = '';
  selectedType         = null;
  incomeBtn.classList.remove('active');
  expenseBtn.classList.remove('active');
}


// =====================
// TYPE BUTTON EVENTS
// =====================
incomeBtn.addEventListener('click', () => {
  selectedType = 'income';
  incomeBtn.classList.add('active');
  expenseBtn.classList.remove('active');
});

expenseBtn.addEventListener('click', () => {
  selectedType = 'expense';
  expenseBtn.classList.add('active');
  incomeBtn.classList.remove('active');
});


// =====================
// ADD TRANSACTION BUTTON
// =====================
addTransactionBtn.addEventListener('click', () => {
  if (!selectedType) {
    alert('Please choose Income or Expense.');
    return;
  }
  const amountValue = parseFloat(amountInput.value);
  if (!amountInput.value || isNaN(amountValue) || amountValue <= 0) {
    alert('Please enter a valid amount greater than zero.');
    return;
  }
  if (!categorySelect.value) {
    alert('Please select a category.');
    return;
  }
  if (!dateInput.value) {
    alert('Please select a date.');
    return;
  }

  addTransaction({
    amount:   amountValue,
    type:     selectedType,
    category: categorySelect.value,
    date:     dateInput.value,
    note:     noteInput.value.trim(),
    icon:     getIconForCategory(categorySelect.value)
  });
});


// =====================
// INIT
// =====================
applyDarkMode();
setCurrentMonth();
loadUserProfile();
loadFromStorage();
updateDashboard();