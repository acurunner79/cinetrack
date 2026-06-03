import { api } from "./client";
import {
  AUTH_ENDPOINTS,
  TMDB_AUTH_URL,
  STORAGE_KEYS,
} from "../constants/tmdb";

// -------------------------------------------------------------------
// Step 1 — Request a temporary token from TMDb
// Returns: { request_token, expires_at, success }
// -------------------------------------------------------------------
export async function getRequestToken() {
  const data = await api.get(AUTH_ENDPOINTS.requestToken);

  if (!data.success) {
    throw new Error("Failed to get request token from TMDb");
  }

  // Persist so CallbackPage can retrieve it after the redirect
  sessionStorage.setItem(STORAGE_KEYS.requestToken, data.request_token);

  return data.request_token;
}

// -------------------------------------------------------------------
// Step 2 — Redirect the user to TMDb to approve the token
// Call this after getRequestToken(). The browser navigates away;
// TMDb will redirect back to `redirectUri` with ?approved=true
// -------------------------------------------------------------------
export function redirectToTmdbAuth(requestToken, redirectUri) {
  const callbackUrl = encodeURIComponent(redirectUri);
  window.location.href = `${TMDB_AUTH_URL}/${requestToken}?redirect_to=${callbackUrl}`;
}

// -------------------------------------------------------------------
// Step 3 — Exchange an approved request token for a session ID
// Call this inside CallbackPage after TMDb redirects back.
// Returns: { session_id, success }
// -------------------------------------------------------------------
export async function createSession(requestToken) {
  const data = await api.post(AUTH_ENDPOINTS.createSession, {
    request_token: requestToken,
  });

  if (!data.success) {
    throw new Error("Failed to create session");
  }

  // Persist session across page refreshes
  localStorage.setItem(STORAGE_KEYS.sessionId, data.session_id);

  // Clean up the temporary request token
  sessionStorage.removeItem(STORAGE_KEYS.requestToken);

  return data.session_id;
}

// -------------------------------------------------------------------
// Fetch the authenticated user's account details
// Requires a valid session_id.
// Returns TMDb account object: { id, username, name, avatar, ... }
// -------------------------------------------------------------------
export async function getAccount(sessionId) {
  return api.get(AUTH_ENDPOINTS.account, {}, sessionId);
}

// -------------------------------------------------------------------
// Delete the session (logout)
// TMDb invalidates the session server-side; we clear local storage.
// -------------------------------------------------------------------
export async function deleteSession(sessionId) {
  try {
    await api.delete(AUTH_ENDPOINTS.deleteSession, {
      session_id: sessionId,
    });
  } finally {
    // Always clear local state even if the API call fails
    localStorage.removeItem(STORAGE_KEYS.sessionId);
    localStorage.removeItem(STORAGE_KEYS.accountId);
  }
}

// -------------------------------------------------------------------
// Restore a persisted session on app load
// Returns { sessionId, accountId } or null if nothing stored
// -------------------------------------------------------------------
export function getStoredSession() {
  const sessionId = localStorage.getItem(STORAGE_KEYS.sessionId);
  const accountId = localStorage.getItem(STORAGE_KEYS.accountId);

  if (!sessionId) return null;
  return { sessionId, accountId };
}
