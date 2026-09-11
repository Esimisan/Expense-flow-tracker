//analysis.js — ExpenseFlow

import { getTransactions } from "./modules/storage.js";
import { applyDarkMode } from "./modules/darkmode.js";
import { formatCurrencyFull, formatCurrencyAbbr } from "./modules/currency.js";
import {
  formatDate,
  getAvailableMonths,
  monthYMToLabel,
} from "./modules/dateutils.js";
import { getExpenseConfig, getIncomeConfig } from "./modules/categories.js";

// POPULATE MONTH DROPDOWN

function populateMonthSelector(transactions) {
  const months = getAvailableMonths(transactions);
  const select = document.getElementById("month-select");
  select.innerHTML = "";
  months.forEach((ym) => {
    const opt = document.createElement("option");
    opt.value = ym;
    opt.textContent = monthYMToLabel(ym);
    select.appendChild(opt);
  });
  return months[0];
}

// CHART INSTANCES

let expenseChartInstance = null;
let incomeChartInstance = null;

// RENDER EXPENSE CHART

function renderExpenseChart(expensesByCategory) {
  const ctx = document.getElementById("expenses-chart").getContext("2d");
  const noMsg = document.getElementById("no-expense-msg");

  if (expenseChartInstance) {
    expenseChartInstance.destroy();
    expenseChartInstance = null;
  }

  const entries = Object.entries(expensesByCategory);
  const total = entries.reduce((sum, [, d]) => sum + d.total, 0);

  document.getElementById("chart-total").textContent =
    formatCurrencyAbbr(total);

  if (total === 0) {
    noMsg.classList.remove("hidden");
    expenseChartInstance = new Chart(ctx, {
      type: "doughnut",
      data: {
        datasets: [{ data: [1], backgroundColor: ["#E5E5EA"], borderWidth: 0 }],
      },
      options: {
        cutout: "65%",
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
          datalabels: { display: false },
        },
      },
    });
    return;
  }

  noMsg.classList.add("hidden");
  const labels = entries.map(([cat]) => getExpenseConfig(cat).label);
  const data = entries.map(([, d]) => d.total);
  const colors = entries.map(([cat]) => getExpenseConfig(cat).color);

  expenseChartInstance = new Chart(ctx, {
    type: "doughnut",
    plugins: [ChartDataLabels],
    data: {
      labels,
      datasets: [
        { data, backgroundColor: colors, borderWidth: 0, hoverOffset: 10 },
      ],
    },
    options: {
      cutout: "65%",
      animation: { animateRotate: true, duration: 700 },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { label: (c) => ` ${formatCurrencyFull(c.parsed)}` },
        },
        datalabels: {
          color: "#fff",
          font: { size: 10, weight: "bold" },
          formatter: (value) => {
            const pct = (value / total) * 100;
            return pct >= 5 ? `${pct.toFixed(1)}%` : "";
          },
        },
      },
    },
  });
}

// RENDER INCOME CHART

function renderIncomeChart(incomeByCategory) {
  const ctx = document.getElementById("income-chart").getContext("2d");
  const noMsg = document.getElementById("no-income-msg");

  if (incomeChartInstance) {
    incomeChartInstance.destroy();
    incomeChartInstance = null;
  }

  const entries = Object.entries(incomeByCategory);
  const total = entries.reduce((sum, [, d]) => sum + d.total, 0);

  document.getElementById("income-chart-total").textContent =
    formatCurrencyAbbr(total);

  if (total === 0) {
    noMsg.classList.remove("hidden");
    incomeChartInstance = new Chart(ctx, {
      type: "doughnut",
      data: {
        datasets: [{ data: [1], backgroundColor: ["#E5E5EA"], borderWidth: 0 }],
      },
      options: {
        cutout: "65%",
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
          datalabels: { display: false },
        },
      },
    });
    return;
  }

  noMsg.classList.add("hidden");
  const labels = entries.map(([cat]) => getIncomeConfig(cat).label);
  const data = entries.map(([, d]) => d.total);
  const colors = entries.map(([cat]) => getIncomeConfig(cat).color);

  incomeChartInstance = new Chart(ctx, {
    type: "doughnut",
    plugins: [ChartDataLabels],
    data: {
      labels,
      datasets: [
        { data, backgroundColor: colors, borderWidth: 0, hoverOffset: 10 },
      ],
    },
    options: {
      cutout: "65%",
      animation: { animateRotate: true, duration: 700 },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { label: (c) => ` ${formatCurrencyFull(c.parsed)}` },
        },
        datalabels: {
          color: "#fff",
          font: { size: 10, weight: "bold" },
          formatter: (value) => {
            const pct = (value / total) * 100;
            return pct >= 5 ? `${pct.toFixed(1)}%` : "";
          },
        },
      },
    },
  });
}

// RENDER BREAKDOWN (shared logic)

function renderBreakdown(byCategory, listId, getConfigFn, txList, type) {
  const list = document.getElementById(listId);
  list.innerHTML = "";

  const entries = Object.entries(byCategory);
  const total = entries.reduce((sum, [, d]) => sum + d.total, 0);

  if (total === 0) {
    list.innerHTML = '<p class="empty-state">No data for this month.</p>';
    return;
  }

  entries.sort((a, b) => b[1].total - a[1].total);

  entries.forEach(([category, data], i) => {
    const cfg = getConfigFn(category);
    const pct = ((data.total / total) * 100).toFixed(2);

    const item = document.createElement("div");
    item.classList.add("breakdown-item");
    item.style.animationDelay = `${i * 0.06}s`;

    item.innerHTML = `
      <div class="breakdown-top">
        <div class="breakdown-icon" style="background:${cfg.bg}">
          <i class="fa-solid ${cfg.icon}" style="color:${cfg.color}"></i>
        </div>
        <div class="breakdown-meta">
          <p class="breakdown-name">${cfg.label}</p>
          <p class="breakdown-count">${data.count} transaction${data.count !== 1 ? "s" : ""}</p>
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

    item.addEventListener("click", () => {
      const categoryTxs = txList.filter((tx) => tx.category === category);
      openCategoryModal(cfg, categoryTxs, type);
    });

    list.appendChild(item);
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      list.querySelectorAll(".progress-fill").forEach((bar) => {
        bar.style.width = bar.dataset.width + "%";
      });
    });
  });
}

// CATEGORY DETAIL MODAL

function openCategoryModal(cfg, transactions, type) {
  const overlay = document.getElementById("category-modal-overlay");
  const iconWrap = document.getElementById("modal-icon");
  const iconEl = document.getElementById("modal-icon-i");
  const titleEl = document.getElementById("modal-title");
  const subtitleEl = document.getElementById("modal-subtitle");
  const bodyEl = document.getElementById("modal-body");

  iconWrap.style.background = cfg.bg;
  iconEl.className = `fa-solid ${cfg.icon}`;
  iconEl.style.color = cfg.color;
  titleEl.textContent = cfg.label;
  subtitleEl.textContent = `${transactions.length} transaction${transactions.length !== 1 ? "s" : ""}`;

  const sorted = [...transactions].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );

  bodyEl.innerHTML = sorted
    .map((tx) => {
      const desc =
        tx.description && tx.description.trim()
          ? tx.description
          : tx.note && tx.note.trim()
            ? tx.note
            : cfg.label; // fallback for legacy entries
      return `
      <div class="modal-row">
        <p class="modal-row-desc">${desc}</p>
        <div class="modal-row-right">
          <p class="modal-row-amount ${type}">${type === "income" ? "+" : "-"}${formatCurrencyFull(tx.amount)}</p>
          <p class="modal-row-date">${formatDate(tx.date)}</p>
        </div>
      </div>
    `;
    })
    .join("");

  overlay.classList.remove("hidden");
  requestAnimationFrame(() => overlay.classList.add("visible"));
}

function closeCategoryModal() {
  const overlay = document.getElementById("category-modal-overlay");
  overlay.classList.remove("visible");
  setTimeout(() => overlay.classList.add("hidden"), 300);
}

// TRANSACTIONS LIST

let showAll = false;
let cachedTransactions = [];

function renderTransactions(transactions) {
  cachedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );

  const list = document.getElementById("transactions-list");
  const seeAllBtn = document.getElementById("see-all-btn");
  list.innerHTML = "";

  if (cachedTransactions.length === 0) {
    list.innerHTML =
      '<p class="empty-state">No transactions for this month.</p>';
    seeAllBtn.style.visibility = "hidden";
    return;
  }

  const hasMore = cachedTransactions.length > 4;
  seeAllBtn.style.visibility = hasMore ? "visible" : "hidden";
  seeAllBtn.textContent = showAll ? "See less" : "See all";

  const toRender = showAll
    ? cachedTransactions
    : cachedTransactions.slice(0, 4);

  toRender.forEach((tx, i) => {
    const cfg =
      tx.type === "income"
        ? getIncomeConfig(tx.category)
        : getExpenseConfig(tx.category);
    const title =
      tx.description && tx.description.trim()
        ? tx.description
        : tx.note && tx.note.trim()
          ? tx.note
          : cfg.label; // fallback for legacy entries

    const item = document.createElement("div");
    item.classList.add("tx-item");
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
        ${tx.type === "income" ? "+" : "-"}${formatCurrencyAbbr(tx.amount)}
      </p>
    `;

    list.appendChild(item);
  });
}

// SLIDER

let currentSlide = 0;

function goToSlide(index) {
  const track = document.getElementById("slider-track");
  const indicators = document.querySelectorAll(".indicator");

  currentSlide = index;
  track.style.transform = `translateX(-${index * 100}%)`;

  indicators.forEach((ind, i) => {
    ind.classList.toggle("active", i === index);
  });
}

function initSlider() {
  const track = document.getElementById("slider-track");
  const indicators = document.querySelectorAll(".indicator");

  // Indicator click
  indicators.forEach((ind, i) => {
    ind.addEventListener("click", () => goToSlide(i));
  });

  // Touch swipe
  let startX = 0;
  let isDragging = false;

  track.addEventListener(
    "touchstart",
    (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    },
    { passive: true },
  );

  track.addEventListener(
    "touchend",
    (e) => {
      if (!isDragging) return;
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0 && currentSlide < 1) goToSlide(1);
        else if (diff < 0 && currentSlide > 0) goToSlide(0);
      }
      isDragging = false;
    },
    { passive: true },
  );

  // Mouse drag for desktop
  let mouseStartX = 0;
  track.addEventListener("mousedown", (e) => {
    mouseStartX = e.clientX;
    isDragging = true;
  });
  track.addEventListener("mouseup", (e) => {
    if (!isDragging) return;
    const diff = mouseStartX - e.clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentSlide < 1) goToSlide(1);
      else if (diff < 0 && currentSlide > 0) goToSlide(0);
    }
    isDragging = false;
  });
}

// MAIN RENDER

function renderAnalysis(selectedYM) {
  const all = getTransactions();
  const monthTxs = all.filter(
    (tx) => tx.date && tx.date.startsWith(selectedYM),
  );

  const monthExpenseTxs = monthTxs.filter((tx) => tx.type === "expense");
  const monthIncomeTxs = monthTxs.filter((tx) => tx.type === "income");

  const expensesByCategory = {};
  monthExpenseTxs.forEach((tx) => {
    if (!expensesByCategory[tx.category])
      expensesByCategory[tx.category] = { total: 0, count: 0 };
    expensesByCategory[tx.category].total += tx.amount;
    expensesByCategory[tx.category].count++;
  });

  const incomeByCategory = {};
  monthIncomeTxs.forEach((tx) => {
    if (!incomeByCategory[tx.category])
      incomeByCategory[tx.category] = { total: 0, count: 0 };
    incomeByCategory[tx.category].total += tx.amount;
    incomeByCategory[tx.category].count++;
  });

  renderExpenseChart(expensesByCategory);
  renderIncomeChart(incomeByCategory);
  renderBreakdown(
    expensesByCategory,
    "breakdown-list",
    getExpenseConfig,
    monthExpenseTxs,
    "expense",
  );
  renderBreakdown(
    incomeByCategory,
    "income-breakdown-list",
    getIncomeConfig,
    monthIncomeTxs,
    "income",
  );
  renderTransactions(monthTxs);
}

// INIT

document.addEventListener("DOMContentLoaded", () => {
  applyDarkMode();

  const all = getTransactions();
  const defaultMonth = populateMonthSelector(all);

  renderAnalysis(defaultMonth);
  initSlider();

  document.getElementById("month-select").addEventListener("change", (e) => {
    showAll = false;
    renderAnalysis(e.target.value);
  });

  document.getElementById("see-all-btn").addEventListener("click", () => {
    showAll = !showAll;
    renderTransactions(cachedTransactions);
  });

  const modalOverlay = document.getElementById("category-modal-overlay");
  document
    .getElementById("modal-close-btn")
    .addEventListener("click", closeCategoryModal);
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeCategoryModal();
  });
});
