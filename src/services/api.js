const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

function getToken() {
  return localStorage.getItem('vote_token');
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.message || data?.error || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}

// ─── Auth ───────────────────────────────────────────────

/** POST /auth/login */
export async function login(email, password) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return { token: data.token, user: data.user };
}

/** POST /auth/signup */
export async function signup({ username, email, password }) {
  const data = await apiFetch('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });
  return { token: data.token, user: data.user };
}

/** GET /auth/me */
export async function getMe() {
  const data = await apiFetch('/auth/me');
  return data.user;
}

// ─── Packages ───────────────────────────────────────────

/** GET /packages */
export async function getPackages() {
  const data = await apiFetch('/packages');
  return data.packages;
}

// ─── Orders ─────────────────────────────────────────────

/** POST /orders — create a purchase order */
export async function createOrder(packageId) {
  const data = await apiFetch('/orders', {
    method: 'POST',
    body: JSON.stringify({ package_id: packageId }),
  });
  return { order: data.order, message: data.message };
}

/** GET /orders — list user's orders */
export async function getOrders() {
  const data = await apiFetch('/orders');
  return data.orders;
}

// ─── Votes & Transactions ───────────────────────────────

/** GET /votes/balance — get balance and stats */
export async function getVoteBalance() {
  const data = await apiFetch('/votes/balance');
  return { balance: data.balance, stats: data.stats };
}

/** POST /votes/send — send votes to a character */
export async function sendVotes(targetName, count, reactionType = 'cool') {
  const data = await apiFetch('/votes/send', {
    method: 'POST',
    body: JSON.stringify({
      target_name: targetName,
      count: count,
      reaction_type: reactionType,
    }),
  });
  return data;
}

/** GET /transactions — list transaction history */
export async function getTransactions(page = 1, limit = 10) {
  const data = await apiFetch(`/transactions?page=${page}&limit=${limit}`);
  return {
    transactions: data.transactions,
    pagination: data.pagination,
  };
}

/** GET /proof — list all proofs of delivery */
export async function getProofs() {
  const data = await apiFetch('/proof');
  return data.proofs;
}

/** POST /redeem — redeem a code for free votes */
export async function redeemCode(code) {
  const data = await apiFetch('/redeem', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
  return data;
}
