# ExpenseFlow

ExpenseFlow is a full-stack expense and income tracker. It started as a purely client-side, `localStorage`-only app and has since been upgraded to a real full-stack application: a vanilla JS frontend backed by a Node.js/Express/MongoDB API with JWT-based authentication.

## Live App

- **Frontend:** [https://esimisan.github.io/Expense-flow-tracker/](https://esimisan.github.io/Expense-flow-tracker/) (GitHub Pages)
- **Backend API:** `https://expense-flow-tracker.onrender.com` (Render)

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
- Sign out (clears the active session and auth token).
- Clear all transaction data with a confirmation prompt, without deleting the user's account.

### 🔐 Authentication

- Real account registration and login, backed by the database — not a simulated local-only session.
- Passwords are hashed with bcrypt before storage; plaintext passwords are never persisted.
- JWT-based sessions: a signed token (20-day expiry) is issued on login/registration and sent with every authenticated request.
- All transaction and settings data is scoped per-user on the backend — one account can never read or modify another account's data.

## How It Works

ExpenseFlow now has two parts:

- **Frontend** (`Frontend/`) — static HTML/CSS/vanilla JS, hosted on GitHub Pages. Handles UI, charts, and all user interaction.
- **Backend** (`backend/`) — a Node/Express REST API backed by MongoDB Atlas, hosted on Render. Handles authentication, and stores/serves all transaction and settings data.

The frontend no longer stores transactions or settings in `localStorage`. Only two things are kept client-side, in `localStorage`:

| Key                 | Purpose                                                                                                                                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `expenseflow_user`  | The signed-in user's profile info (name, email, avatar), used to render the UI without an extra API call.                                                                                                          |
| `expenseflow_token` | The JWT issued at login/registration. Sent as an `Authorization: Bearer <token>` header on every API request. Also decoded client-side to check expiry (UX only — the backend independently verifies every token). |

Everything else — transactions, settings (currency, monthly budget, dark mode) — lives in MongoDB and is fetched from/written to the API on demand. This means data now follows the user across browsers and devices, instead of being tied to a single browser's local storage.

## API Overview

All endpoints are mounted on the backend base URL and require a valid `Authorization: Bearer <token>` header except where noted.

| Endpoint                | Method(s)       | Description                                                                                |
| ----------------------- | --------------- | ------------------------------------------------------------------------------------------ |
| `/api/auth/register`    | `POST`          | Create a new account (name, email, password). No token required.                           |
| `/api/auth/login`       | `POST`          | Log in with email/password, returns a JWT. No token required.                              |
| `/api/transactions`     | `GET`, `POST`   | List the current user's transactions / create a new one.                                   |
| `/api/transactions/:id` | `PUT`, `DELETE` | Update or delete a specific transaction (must belong to the current user).                 |
| `/api/settings`         | `GET`, `PUT`    | Get or partially update the current user's settings (currency, monthly budget, dark mode). |

## Pages

- **`index.html`** — Registration / entry point.
- **`login.html`** + `login.js` — Sign-in page (separate from registration).
- **`dashboard.html`** + `dashboard.js` — Main screen for adding transactions and viewing balance summaries.
- **`analysis.html`** + `analysis.js` — Visual breakdown of spending and income by category and by month.
- **`settings.html`** + `settings.js` — Profile, currency, budget, dark mode, and data management.

## Tech Stack

**Frontend**

- HTML5 / CSS3 (including a dark mode theme)
- Vanilla JavaScript (ES modules) — no frameworks, no build tools
- [Chart.js](https://www.chartjs.org/) with the `chartjs-plugin-datalabels` plugin for the doughnut charts on the Analysis page
- Font Awesome for category and UI icons

**Backend**

- Node.js + Express.js
- MongoDB Atlas + Mongoose
- JWT (`jsonwebtoken`) for authentication
- bcrypt for password hashing
- `dotenv` for environment configuration
- `cors` for cross-origin requests from the GitHub Pages frontend

## Project Structure

```
ExpenseFlow/
├── Frontend/          # static frontend (HTML/CSS/JS)
└── backend/           # Node/Express/MongoDB API
    ├── config/        # database connection
    ├── controllers/   # route handler logic (auth, transactions, settings)
    ├── middleware/     # JWT auth guard
    ├── models/        # Mongoose schemas (User, Transaction)
    ├── routes/        # Express routers
    ├── utils/         # token generation, etc.
    └── server.js
```

## Getting Started (Local Development)

**Backend**

1. `cd backend`
2. `npm install`
3. Create a `.env` file with:
   ```
   MONGODB_URI=<your MongoDB Atlas connection string>
   JWT_SECRET=<any long random string>
   PORT=5000
   ```
4. `npm start` — the API will run on `http://localhost:5000`.

**Frontend**

1. Open `Frontend/index.html` with a static file server (e.g. VS Code Live Server, or `npx serve`) — opening it directly as a `file://` URL will not work correctly with ES modules.
2. Make sure `Frontend/js/modules/api.js`'s `BASE_URL` points at your local backend (`http://localhost:5000`) during development, and at the deployed Render URL in production.
3. Register a new account and start tracking transactions — data is now persisted in MongoDB, not `localStorage`.

> ⚠️ Since account data now lives in MongoDB rather than `localStorage`, your data follows your account across browsers and devices — but it also means the backend must be running (or the deployed Render instance reachable) for the app to function.

## Notes for Contributors

- All backend routes under `/api/transactions` and `/api/settings` are protected by the `protect` middleware and scoped to `req.user._id` — never trust a client-supplied user ID.
- File imports on the frontend are case-sensitive in production (GitHub Pages), even though local dev on some setups is case-insensitive — double-check that import paths match actual filenames exactly (this previously caused a live 404 with `authguard.js`).
- When adding new fields to the `User` or `Transaction` Mongoose models, update the corresponding controller logic and remember that partial updates (e.g. settings `PUT`) should not silently drop unspecified fields.
- Rotate `MONGODB_URI` and `JWT_SECRET` if they were ever shared in plaintext (e.g. pasted into a chat or committed accidentally) before treating this as production-ready.
