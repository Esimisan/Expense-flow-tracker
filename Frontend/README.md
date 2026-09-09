# ExpenseFlow

ExpenseFlow is a lightweight, browser-based expense and income tracker. It runs entirely on the client side — no backend, no database, no build step — using `localStorage` to persist all data on the user's device.

## Features

### 📊 Dashboard
- Add income and expense transactions with an amount, category, date, and description.
- Category lists automatically switch depending on whether "Income" or "Expense" is selected (e.g. Salary/Freelance/Business vs. Food & Dining/Rent/Transport).
- Live summary cards for **Balance**, **Total Income**, and **Total Expenses**, recalculated on every change.
- Optional monthly budget with an on-screen warning banner when expenses exceed it.
- A running activity feed of recent transactions, each shown with a category icon, description, and formatted date.
- Personalized greeting ("Welcome" on first visit, "Welcome back" afterward) and profile avatar shown in the header.

### 📈 Analysis
- Month selector that automatically lists every month with recorded activity.
- Two doughnut charts (via Chart.js) breaking down **expenses** and **income** by category, with percentage labels and a formatted total in the center.
- Clickable category breakdown lists showing the amount, transaction count, and percentage share per category, with animated progress bars.
- Tapping a category opens a modal listing every transaction in that category for the selected month.
- A swipeable slider (touch and mouse drag supported) for moving between the expense and income views.
- A "See all / See less" toggle for the full transaction list.

### ⚙️ Settings
- Edit profile avatar via a picker of preset avatar images.
- Choose a currency from a large list of supported currencies (symbols are applied consistently across the dashboard and analysis pages).
- Set or update a monthly budget.
- Toggle dark mode, applied instantly and remembered across sessions.
- Sign out (clears the active user session).
- Clear all transaction data with a confirmation prompt, without deleting the user's account.

## How It Works

ExpenseFlow has no server component. All application state is stored in the browser's `localStorage` under a few keys:

| Key | Purpose |
|---|---|
| `expenseflow_user` | The signed-in user's profile (name, email, avatar, first-visit flag). Its presence also acts as the auth guard — pages redirect to `index.html` if it's missing. |
| `expenseflow_transactions` | An array of every income/expense transaction (amount, type, category, date, description). |
| `expenseflow_settings` | User preferences: currency, monthly budget, and dark mode. |

Every page reads from these keys on load, renders the UI accordingly, and writes back to `localStorage` whenever something changes — so data persists across page refreshes and sessions on the same browser/device.

## Pages

- **`index.html`** — Sign-in / entry point. (Referenced as the redirect target when no user session exists.)
- **`dashboard.html`** + `dashboard.js` — Main screen for adding transactions and viewing balance summaries.
- **`analysis.html`** + `analysis.js` — Visual breakdown of spending and income by category and by month.
- **`settings.html`** + `settings.js` — Profile, currency, budget, dark mode, and data management.

## Tech Stack

- **HTML5 / CSS3** for structure and styling (including a dark mode theme).
- **Vanilla JavaScript** — no frameworks, no build tools.
- **[Chart.js](https://www.chartjs.org/)** with the `chartjs-plugin-datalabels` plugin for the doughnut charts on the Analysis page.
- **Font Awesome** for category and UI icons.
- **`localStorage`** for all data persistence — everything lives in the browser, so there's no setup, signup server, or database to run.

## Getting Started

Since this is a static, client-side app, no installation is required:

1. Clone the repository.
2. Open `index.html` in a browser (or serve the folder with any static file server, e.g. `npx serve` or the VS Code Live Server extension).
3. Sign in / create a profile to start tracking transactions.

> ⚠️ Because data is stored in `localStorage`, it is tied to a specific browser on a specific device. Clearing browser data, using a different browser, or using incognito mode will not show previously saved transactions.

## Notes for Contributors

- When adding new fields to stored objects (users, transactions, settings), keep `JSON.parse`/`JSON.stringify` calls consistent across all pages that read that key — dashboard, analysis, and settings all read from the same `localStorage` keys independently.
- Attribute values used to identify or select elements (like avatar `src`/`data-src`) must match exactly between HTML and the JS that reads them; a mismatch can cause a feature to silently fail without throwing an error.
