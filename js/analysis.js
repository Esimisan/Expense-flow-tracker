/* ================================
   analysis.js — ExpenseFlow
   ================================ */

// -------------------------------------------------------
// EXPENSE CATEGORY CONFIG
// -------------------------------------------------------
const EXPENSE_CONFIG = {
  'food & dining': {
    color: '#FF6B6B', bg: '#FFE9E9',
    icon: 'fa-utensils', label: 'Food & Dining'
  },
  'rent': {
    color: '#5856D6', bg: '#EEEEFF',
    icon: 'fa-building', label: 'Housing'
  },
  'transport': {
    color: '#FF6584', bg: '#FFE9EE',
    icon: 'fa-car', label: 'Transportation'
  },
  'shopping': {
    color: '#845EF7', bg: '#F0EBFF',
    icon: 'fa-bag-shopping', label: 'Shopping'
  },
  'healthcare': {
    color: '#FF9F0A', bg: '#FFF4E0',
    icon: 'fa-heart-pulse', label: 'Healthcare'
  },
  'bills & utilities': {
    color: '#30D158', bg: '#E5FAE9',
    icon: 'fa-file-invoice', label: 'Bills & Utilities'
  },
  'entertainment': {
    color: '#FF453A', bg: '#FFE8E7',
    icon: 'fa-film', label: 'Entertainment'
  },
  'other': {
    color: '#8E8E93', bg: '#F2F2F7',
    icon: 'fa-circle-dot', label: 'Other'
  }
};

// -------------------------------------------------------
// INCOME CATEGORY CONFIG
// -------------------------------------------------------
const INCOME_CONFIG = {
  'salary': {
    color: '#34C759', bg: '#E9F8EE',
    icon: 'fa-briefcase', label: 'Salary'
  },
  'freelance': {
    color: '#0AC8B9', bg: '#E0FAF8',
    icon: 'fa-laptop-code', label: 'Freelance'
  },
  'business': {
    color: '#5856D6', bg: '#EEEEFF',
    icon: 'fa-store', label: 'Business'
  },
  'investments': {
    color: '#FF9F0A', bg: '#FFF4E0',
    icon: 'fa-chart-line', label: 'Investments'
  },
  'gifts': {
    color: '#FF6584', bg: '#FFE9EE',
    icon: 'fa-gift', label: 'Gifts'
  }
};

function getExpenseConfig(category) {
  return EXPENSE_CONFIG[category] || { color: '#8E8E93', bg: '#F2F2F7', icon: 'fa-circle-dot', label: category };
}

function getIncomeConfig(category) {
  return INCOME_CONFIG[category] || { color: '#34C759', bg: '#E9F8EE', icon: 'fa-circle-dot', label: category };
}

// -------------------------------------------------------
// LOAD FROM LOCAL STORAGE
// -------------------------------------------------------
function loadTransactions() {
  const saved = localStorage.getItem('expenseflow_transactions');
  return saved ? JSON.parse(saved) : [];
}

// -------------------------------------------------------
// MONTH UTILITIES
// -------------------------------------------------------
function getAvailableMonths(transactions) {
  const set = new Set();
  const now = new Date();
  const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  set.add(currentYM);
  transactions.forEach(tx => {
    if (tx.date) set.add(tx.date.substring(0, 7));
  });
  return [...set].sort((a, b) => b.localeCompare(a));
}

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

function monthYMToLabel(ym) {
  const [year, month] = ym.split('-');
  const now = new Date();
  const label = MONTH_NAMES[parseInt(month, 10) - 1];
  return parseInt(year, 10) === now.getFullYear() ? label : `${label} ${year}`;
}

// -------------------------------------------------------
// CURRENCY SYMBOL
// -------------------------------------------------------
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

// -------------------------------------------------------
// FORMAT HELPERS
// -------------------------------------------------------
function formatCurrencyAbbr(amount) {
  const s = getCurrencySymbol();
  if (amount >= 1_000_000_000) return `${s}${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000)     return `${s}${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000)         return `${s}${(amount / 1_000).toFixed(0)}K`;
  return `${s}${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatCurrencyFull(amount) {
  const s = getCurrencySymbol();
  return `${s}${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateString) {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  const short = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${short[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
}

// -------------------------------------------------------
// POPULATE MONTH DROPDOWN
// -------------------------------------------------------
function populateMonthSelector(transactions) {
  const months = getAvailableMonths(transactions);
  const select = document.getElementById('month-select');
  select.innerHTML = '';
  months.forEach(ym => {
    const opt = document.createElement('option');
    opt.value = ym;
    opt.textContent = monthYMToLabel(ym);
    select.appendChild(opt);
  });
  return months[0];
}

// -------------------------------------------------------
// CHART INSTANCES
// -------------------------------------------------------
let expenseChartInstance = null;
let incomeChartInstance  = null;

// -------------------------------------------------------
// RENDER EXPENSE CHART
// -------------------------------------------------------
function renderExpenseChart(expensesByCategory) {
  const ctx   = document.getElementById('expenses-chart').getContext('2d');
  const noMsg = document.getElementById('no-expense-msg');

  if (expenseChartInstance) { expenseChartInstance.destroy(); expenseChartInstance = null; }

  const entries = Object.entries(expensesByCategory);
  const total   = entries.reduce((sum, [, d]) => sum + d.total, 0);

  document.getElementById('chart-total').textContent = formatCurrencyAbbr(total);

  if (total === 0) {
    noMsg.classList.remove('hidden');
    expenseChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: { datasets: [{ data: [1], backgroundColor: ['#E5E5EA'], borderWidth: 0 }] },
      options: { cutout: '65%', plugins: { legend: { display: false }, tooltip: { enabled: false }, datalabels: { display: false } } }
    });
    return;
  }

  noMsg.classList.add('hidden');
  const labels = entries.map(([cat]) => getExpenseConfig(cat).label);
  const data   = entries.map(([, d]) => d.total);
  const colors = entries.map(([cat]) => getExpenseConfig(cat).color);

  expenseChartInstance = new Chart(ctx, {
    type: 'doughnut',
    plugins: [ChartDataLabels],
    data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 0, hoverOffset: 10 }] },
    options: {
      cutout: '65%',
      animation: { animateRotate: true, duration: 700 },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (c) => ` ${formatCurrencyFull(c.parsed)}` } },
        datalabels: {
          color: '#fff',
          font: { size: 10, weight: 'bold' },
          formatter: (value) => {
            const pct = (value / total) * 100;
            return pct >= 5 ? `${pct.toFixed(1)}%` : '';
          }
        }
      }
    }
  });
}

// -------------------------------------------------------
// RENDER INCOME CHART
// -------------------------------------------------------
function renderIncomeChart(incomeByCategory) {
  const ctx   = document.getElementById('income-chart').getContext('2d');
  const noMsg = document.getElementById('no-income-msg');

  if (incomeChartInstance) { incomeChartInstance.destroy(); incomeChartInstance = null; }

  const entries = Object.entries(incomeByCategory);
  const total   = entries.reduce((sum, [, d]) => sum + d.total, 0);

  document.getElementById('income-chart-total').textContent = formatCurrencyAbbr(total);

  if (total === 0) {
    noMsg.classList.remove('hidden');
    incomeChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: { datasets: [{ data: [1], backgroundColor: ['#E5E5EA'], borderWidth: 0 }] },
      options: { cutout: '65%', plugins: { legend: { display: false }, tooltip: { enabled: false }, datalabels: { display: false } } }
    });
    return;
  }

  noMsg.classList.add('hidden');
  const labels = entries.map(([cat]) => getIncomeConfig(cat).label);
  const data   = entries.map(([, d]) => d.total);
  const colors = entries.map(([cat]) => getIncomeConfig(cat).color);

  incomeChartInstance = new Chart(ctx, {
    type: 'doughnut',
    plugins: [ChartDataLabels],
    data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 0, hoverOffset: 10 }] },
    options: {
      cutout: '65%',
      animation: { animateRotate: true, duration: 700 },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (c) => ` ${formatCurrencyFull(c.parsed)}` } },
        datalabels: {
          color: '#fff',
          font: { size: 10, weight: 'bold' },
          formatter: (value) => {
            const pct = (value / total) * 100;
            return pct >= 5 ? `${pct.toFixed(1)}%` : '';
          }
        }
      }
    }
  });
}

// -------------------------------------------------------
// RENDER BREAKDOWN (shared logic)
// -------------------------------------------------------
function renderBreakdown(byCategory, listId, getConfigFn) {
  const list = document.getElementById(listId);
  list.innerHTML = '';

  const entries = Object.entries(byCategory);
  const total   = entries.reduce((sum, [, d]) => sum + d.total, 0);

  if (total === 0) {
    list.innerHTML = '<p class="empty-state">No data for this month.</p>';
    return;
  }

  entries.sort((a, b) => b[1].total - a[1].total);

  entries.forEach(([category, data], i) => {
    const cfg = getConfigFn(category);
    const pct = ((data.total / total) * 100).toFixed(2);

    const item = document.createElement('div');
    item.classList.add('breakdown-item');
    item.style.animationDelay = `${i * 0.06}s`;

    item.innerHTML = `
      <div class="breakdown-top">
        <div class="breakdown-icon" style="background:${cfg.bg}">
          <i class="fa-solid ${cfg.icon}" style="color:${cfg.color}"></i>
        </div>
        <div class="breakdown-meta">
          <p class="breakdown-name">${cfg.label}</p>
          <p class="breakdown-count">${data.count} transaction${data.count !== 1 ? 's' : ''}</p>
        </div>
        <div class="breakdown-right">
          <p class="breakdown-amount">${formatCurrencyFull(data.total)}</p>
          <p class="breakdown-pct">${pct}%</p>
        </div>
      </div>
      <div class="progress-track">
        <div class="progress-fill" style="width:0%; background:${cfg.color}" data-width="${pct}"></div>
      </div>
    `;

    list.appendChild(item);
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      list.querySelectorAll('.progress-fill').forEach(bar => {
        bar.style.width = bar.dataset.width + '%';
      });
    });
  });
}

// -------------------------------------------------------
// TRANSACTIONS LIST
// -------------------------------------------------------
let showAll = false;
let cachedTransactions = [];

function renderTransactions(transactions) {
  cachedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

  const list      = document.getElementById('transactions-list');
  const seeAllBtn = document.getElementById('see-all-btn');
  list.innerHTML  = '';

  if (cachedTransactions.length === 0) {
    list.innerHTML = '<p class="empty-state">No transactions for this month.</p>';
    seeAllBtn.style.visibility = 'hidden';
    return;
  }

  const hasMore = cachedTransactions.length > 4;
  seeAllBtn.style.visibility = hasMore ? 'visible' : 'hidden';
  seeAllBtn.textContent = showAll ? 'See less' : 'See all';

  const toRender = showAll ? cachedTransactions : cachedTransactions.slice(0, 4);

  toRender.forEach((tx, i) => {
    const cfg   = tx.type === 'income' ? getIncomeConfig(tx.category) : getExpenseConfig(tx.category);
    const title = (tx.note && tx.note.trim()) ? tx.note : cfg.label;

    const item = document.createElement('div');
    item.classList.add('tx-item');
    item.style.animationDelay = `${i * 0.05}s`;

    item.innerHTML = `
      <div class="tx-icon" style="background:${cfg.bg}">
        <i class="fa-solid ${cfg.icon}" style="color:${cfg.color}"></i>
      </div>
      <div class="tx-details">
        <p class="tx-title">${title}</p>
        <p class="tx-category">${cfg.label}</p>
        <p class="tx-date">${formatDate(tx.date)}</p>
      </div>
      <p class="tx-amount ${tx.type}">
        ${tx.type === 'income' ? '+' : '-'}${formatCurrencyAbbr(tx.amount)}
      </p>
    `;

    list.appendChild(item);
  });
}

// -------------------------------------------------------
// SLIDER
// -------------------------------------------------------
let currentSlide = 0;

function goToSlide(index) {
  const track      = document.getElementById('slider-track');
  const indicators = document.querySelectorAll('.indicator');

  currentSlide = index;
  track.style.transform = `translateX(-${index * 100}%)`;

  indicators.forEach((ind, i) => {
    ind.classList.toggle('active', i === index);
  });
}

function initSlider() {
  const track      = document.getElementById('slider-track');
  const indicators = document.querySelectorAll('.indicator');

  // Indicator click
  indicators.forEach((ind, i) => {
    ind.addEventListener('click', () => goToSlide(i));
  });

  // Touch swipe
  let startX = 0;
  let isDragging = false;

  track.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    isDragging = true;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentSlide < 1) goToSlide(1);
      else if (diff < 0 && currentSlide > 0) goToSlide(0);
    }
    isDragging = false;
  }, { passive: true });

  // Mouse drag for desktop
  let mouseStartX = 0;
  track.addEventListener('mousedown', (e) => { mouseStartX = e.clientX; isDragging = true; });
  track.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    const diff = mouseStartX - e.clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentSlide < 1) goToSlide(1);
      else if (diff < 0 && currentSlide > 0) goToSlide(0);
    }
    isDragging = false;
  });
}

// -------------------------------------------------------
// MAIN RENDER
// -------------------------------------------------------
function renderAnalysis(selectedYM) {
  const all      = loadTransactions();
  const monthTxs = all.filter(tx => tx.date && tx.date.startsWith(selectedYM));

  // Group expenses by category
  const expensesByCategory = {};
  monthTxs.filter(tx => tx.type === 'expense').forEach(tx => {
    if (!expensesByCategory[tx.category]) expensesByCategory[tx.category] = { total: 0, count: 0 };
    expensesByCategory[tx.category].total += tx.amount;
    expensesByCategory[tx.category].count++;
  });

  // Group income by category
  const incomeByCategory = {};
  monthTxs.filter(tx => tx.type === 'income').forEach(tx => {
    if (!incomeByCategory[tx.category]) incomeByCategory[tx.category] = { total: 0, count: 0 };
    incomeByCategory[tx.category].total += tx.amount;
    incomeByCategory[tx.category].count++;
  });

  renderExpenseChart(expensesByCategory);
  renderIncomeChart(incomeByCategory);
  renderBreakdown(expensesByCategory, 'breakdown-list', getExpenseConfig);
  renderBreakdown(incomeByCategory, 'income-breakdown-list', getIncomeConfig);
  renderTransactions(monthTxs);
}

// -------------------------------------------------------
// DARK MODE
// -------------------------------------------------------
function applyDarkMode() {
  const raw = localStorage.getItem('expenseflow_settings');
  if (!raw) return;
  const settings = JSON.parse(raw);
  if (settings.darkMode) document.body.classList.add('dark-mode');
  else document.body.classList.remove('dark-mode');
}

// -------------------------------------------------------
// INIT
// -------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  applyDarkMode();

  const all          = loadTransactions();
  const defaultMonth = populateMonthSelector(all);

  renderAnalysis(defaultMonth);
  initSlider();

  document.getElementById('month-select').addEventListener('change', (e) => {
    showAll = false;
    renderAnalysis(e.target.value);
  });

  document.getElementById('see-all-btn').addEventListener('click', () => {
    showAll = !showAll;
    renderTransactions(cachedTransactions);
  });
});
