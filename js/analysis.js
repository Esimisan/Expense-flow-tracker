/* ================================
   analysis.js — ExpenseFlow
   ================================ */

// -------------------------------------------------------
// CATEGORY CONFIG
// Each category has: color, light background, icon, label
// -------------------------------------------------------
const CATEGORY_CONFIG = {
  'salary': {
    color: '#34C759', bg: '#E9F8EE',
    icon: 'fa-briefcase', label: 'Salary'
  },
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
  'freelance': {
    color: '#0AC8B9', bg: '#E0FAF8',
    icon: 'fa-laptop-code', label: 'Freelance'
  },
  'other': {
    color: '#8E8E93', bg: '#F2F2F7',
    icon: 'fa-circle-dot', label: 'Other'
  }
};

function getCategoryConfig(category) {
  return CATEGORY_CONFIG[category] || CATEGORY_CONFIG['other'];
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

  // Always include the current month
  const now = new Date();
  const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  set.add(currentYM);

  transactions.forEach(tx => {
    if (tx.date) set.add(tx.date.substring(0, 7));
  });

  // Sort descending: most recent first
  return [...set].sort((a, b) => b.localeCompare(a));
}

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

function monthYMToLabel(ym) {
  const [year, month] = ym.split('-');
  const now = new Date();
  const currentYear = now.getFullYear();
  const label = MONTH_NAMES[parseInt(month, 10) - 1];
  return parseInt(year, 10) === currentYear ? label : `${label} ${year}`;
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

  return months[0]; // most recent month as default
}

// -------------------------------------------------------
// CHART
// -------------------------------------------------------
let chartInstance = null;

function renderChart(expensesByCategory) {
  const ctx = document.getElementById('expenses-chart').getContext('2d');
  const noMsg = document.getElementById('no-expense-msg');

  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  const entries = Object.entries(expensesByCategory);
  const total = entries.reduce((sum, [, d]) => sum + d.total, 0);

  document.getElementById('chart-total').textContent = formatCurrencyAbbr(total);

  if (total === 0) {
    noMsg.classList.remove('hidden');
    // Draw an empty grey donut
    chartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [1],
          backgroundColor: ['#E5E5EA'],
          borderWidth: 0
        }]
      },
      options: {
        cutout: '65%',
        plugins: { legend: { display: false }, tooltip: { enabled: false }, datalabels: { display: false } }
      }
    });
    return;
  }

  noMsg.classList.add('hidden');

  const labels = entries.map(([cat]) => getCategoryConfig(cat).label);
  const data   = entries.map(([, d]) => d.total);
  const colors = entries.map(([cat]) => getCategoryConfig(cat).color);

  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    plugins: [ChartDataLabels],
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderWidth: 0,
        hoverOffset: 10
      }]
    },
    options: {
      cutout: '65%',
      animation: { animateRotate: true, duration: 700 },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${formatCurrencyFull(ctx.parsed)}`
          }
        },
        datalabels: {
          color: '#fff',
          font: { size: 10, weight: 'bold', family: "'Nunito', sans-serif" },
          formatter: (value) => {
            const pct = (value / total) * 100;
            return pct >= 5 ? `${pct.toFixed(1)}%` : '';
          },
          textShadow: true,
          textShadowBlur: 4,
          textShadowColor: 'rgba(0,0,0,0.25)'
        }
      }
    }
  });
}

// -------------------------------------------------------
// EXPENSES BREAKDOWN
// -------------------------------------------------------
function renderBreakdown(expensesByCategory) {
  const list = document.getElementById('breakdown-list');
  list.innerHTML = '';

  const entries = Object.entries(expensesByCategory);
  const total = entries.reduce((sum, [, d]) => sum + d.total, 0);

  if (total === 0) {
    list.innerHTML = '<p class="empty-state">No expense data for this month.</p>';
    return;
  }

  // Sort by amount descending
  entries.sort((a, b) => b[1].total - a[1].total);

  entries.forEach(([category, data], i) => {
    const cfg = getCategoryConfig(category);
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

  // Animate progress bars after DOM is painted
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.querySelectorAll('.progress-fill').forEach(bar => {
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
  // Sort newest first
  cachedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

  const list = document.getElementById('transactions-list');
  const seeAllBtn = document.getElementById('see-all-btn');
  list.innerHTML = '';

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
    const cfg = getCategoryConfig(tx.category);
    // Use note as title if provided, otherwise use category label
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
// MAIN RENDER — called on page load and month change
// -------------------------------------------------------
function renderAnalysis(selectedYM) {
  const all = loadTransactions();

  // Filter by selected month
  const monthTxs = all.filter(tx => tx.date && tx.date.startsWith(selectedYM));

  // Group expenses by category
  const expensesByCategory = {};
  monthTxs
    .filter(tx => tx.type === 'expense')
    .forEach(tx => {
      if (!expensesByCategory[tx.category]) {
        expensesByCategory[tx.category] = { total: 0, count: 0 };
      }
      expensesByCategory[tx.category].total += tx.amount;
      expensesByCategory[tx.category].count++;
    });

  renderChart(expensesByCategory);
  renderBreakdown(expensesByCategory);
  renderTransactions(monthTxs);
}

// -------------------------------------------------------
// DARK MODE
// -------------------------------------------------------
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

// -------------------------------------------------------
// INIT
// -------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  applyDarkMode();
  const all = loadTransactions();
  const defaultMonth = populateMonthSelector(all);

  renderAnalysis(defaultMonth);

  // Month change
  document.getElementById('month-select').addEventListener('change', (e) => {
    showAll = false;
    renderAnalysis(e.target.value);
  });

  // See all / see less
  document.getElementById('see-all-btn').addEventListener('click', () => {
    showAll = !showAll;
    renderTransactions(cachedTransactions);
  });
});