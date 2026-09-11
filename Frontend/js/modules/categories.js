// categories.js — ExpenseFlow
//Contains the configuration for each category, including its color, background color, icon, and label.

export const EXPENSE_CONFIG = {
  "food & dining": {
    color: "#FF6B6B",
    bg: "#FFE9E9",
    icon: "fa-utensils",
    label: "Food & Dining",
  },
  rent: {
    color: "#5856D6",
    bg: "#EEEEFF",
    icon: "fa-building",
    label: "Housing",
  },
  transport: {
    color: "#FF6584",
    bg: "#FFE9EE",
    icon: "fa-car",
    label: "Transportation",
  },
  shopping: {
    color: "#845EF7",
    bg: "#F0EBFF",
    icon: "fa-bag-shopping",
    label: "Shopping",
  },
  healthcare: {
    color: "#FF9F0A",
    bg: "#FFF4E0",
    icon: "fa-heart-pulse",
    label: "Healthcare",
  },
  "bills & utilities": {
    color: "#30D158",
    bg: "#E5FAE9",
    icon: "fa-file-invoice",
    label: "Bills & Utilities",
  },
  entertainment: {
    color: "#FF453A",
    bg: "#FFE8E7",
    icon: "fa-film",
    label: "Entertainment",
  },
  other: {
    color: "#8E8E93",
    bg: "#F2F2F7",
    icon: "fa-circle-dot",
    label: "Other",
  },
};

export const INCOME_CONFIG = {
  salary: {
    color: "#34C759",
    bg: "#E9F8EE",
    icon: "fa-briefcase",
    label: "Salary",
  },
  freelance: {
    color: "#0AC8B9",
    bg: "#E0FAF8",
    icon: "fa-laptop-code",
    label: "Freelance",
  },
  business: {
    color: "#5856D6",
    bg: "#EEEEFF",
    icon: "fa-store",
    label: "Business",
  },
  investments: {
    color: "#FF9F0A",
    bg: "#FFF4E0",
    icon: "fa-chart-line",
    label: "Investments",
  },
  gifts: { color: "#FF6584", bg: "#FFE9EE", icon: "fa-gift", label: "Gifts" },
};

export function getExpenseConfig(category) {
  return (
    EXPENSE_CONFIG[category] || {
      color: "#8E8E93",
      bg: "#F2F2F7",
      icon: "fa-circle-dot",
      label: category,
    }
  );
}

export function getIncomeConfig(category) {
  return (
    INCOME_CONFIG[category] || {
      color: "#34C759",
      bg: "#E9F8EE",
      icon: "fa-circle-dot",
      label: category,
    }
  );
}

// Looks up the right config based on a transaction's type ('income' | 'expense').
export function getCategoryConfig(type, category) {
  return type === "income"
    ? getIncomeConfig(category)
    : getExpenseConfig(category);
}
