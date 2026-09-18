// api.js - centralized API configuration.

const BASE_URL = "https://expense-flow-tracker.onrender.com";

const API = {
  base: BASE_URL,
  // Auth endpoints
  auth: {
    register: `${BASE_URL}/api/auth/register`,
    login: `${BASE_URL}/api/auth/login`,
  },
  //Transaction endpoints
  transactions: {
    base: `${BASE_URL}/api/transactions`,
    byId: (id) => `${BASE_URL}/api/transactions/${id}`,
  },
  settings: {
    base: `${BASE_URL}/api/settings`,
  },
};

export default API;
