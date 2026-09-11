//darkMode.js — ExpenseFlow

import { getSettings } from "./storage.js";

export function applyDarkMode() {
  const settings = getSettings();
  document.body.classList.toggle(
    "dark-mode",
    !!(settings && settings.darkMode),
  );
}
