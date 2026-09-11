//authGuard.js — ExpenseFlow

import { getUser } from "./storage.js";

// Redirects to the sign-in page if no user is stored, and returns the user otherwise. Call this at the top of a protected page's module script.
export function requireUser() {
  const user = getUser();
  if (!user) {
    window.location.replace("index.html");
    return null;
  }
  return user;
}

// Redirects away (to the dashboard by default) if a user is already signed in. Used on the registration/sign-in page.
export function redirectIfLoggedIn(destination = "dashboard.html") {
  const user = getUser();
  if (user) {
    window.location.replace(destination);
    return true;
  }
  return false;
}
