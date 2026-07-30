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
export async function createOrder(packageId, discordUsername = null) {
  const body = { package_id: packageId };
  if (discordUsername) body.discord_username = discordUsername;
  const data = await apiFetch('/orders', {
    method: 'POST',
    body: JSON.stringify(body),
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

/** POST /auth/link-discord — link website account to Discord */
export async function linkDiscord(code) {
  const data = await apiFetch('/auth/link-discord', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
  return data;
}

// ─── Admin / Moderator ──────────────────────────────────

function query(params) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, value);
    }
  }
  const str = search.toString();
  return str ? `?${str}` : '';
}

/** GET /admin/users — search users (staff); gift_cap is null for admins */
export async function searchUsers({ search = '', page = 1, limit = 10 } = {}) {
  const data = await apiFetch(`/admin/users${query({ search, page, limit })}`);
  return {
    users: data.users,
    gift_cap: data.gift_cap,
    viewer_role: data.viewer_role,
    pagination: data.pagination,
  };
}

/** PATCH /admin/users/:id/role — promote or demote a user (admin only) */
export async function setUserRole(userId, role) {
  return apiFetch(`/admin/users/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
}

/** POST /admin/gift — gift votes to a user (staff) */
export async function giftVotes({ userId, username, amount, note }) {
  const body = { amount: Number(amount) };
  if (userId) body.user_id = userId;
  if (username) body.username = username;
  if (note) body.note = note;
  return apiFetch('/admin/gift', { method: 'POST', body: JSON.stringify(body) });
}

/** GET /admin/codes — list all redeem codes (staff) */
export async function getRedeemCodes() {
  const data = await apiFetch('/admin/codes');
  return data.codes;
}

/** POST /admin/codes — create a redeem code; omit code to auto-generate (staff) */
export async function createRedeemCode({ code, votes, maxUses, expiresAt }) {
  const body = { votes: Number(votes) };
  if (code) body.code = code;
  if (maxUses) body.max_uses = Number(maxUses);
  if (expiresAt) body.expires_at = expiresAt;
  const data = await apiFetch('/admin/codes', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return data.code;
}

/** DELETE /admin/codes/:id — delete a redeem code (staff) */
export async function deleteRedeemCode(id) {
  return apiFetch(`/admin/codes/${id}`, { method: 'DELETE' });
}

/** GET /admin/vote-history — site-wide vote send history (staff) */
export async function getVoteHistory({
  search = '',
  reactionType = '',
  page = 1,
  limit = 20,
} = {}) {
  const data = await apiFetch(
    `/admin/vote-history${query({ search, reaction_type: reactionType, page, limit })}`,
  );
  return { history: data.history, pagination: data.pagination };
}

/** GET /admin/audit — staff action audit log (staff) */
export async function getAuditLog({ action = '', actor = '', page = 1, limit = 20 } = {}) {
  const data = await apiFetch(`/admin/audit${query({ action, actor, page, limit })}`);
  return { actions: data.actions, pagination: data.pagination };
}
