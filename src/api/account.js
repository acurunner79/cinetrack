import { api } from "./client";

// -------------------------------------------------------------------
// All account endpoints require a session_id passed as the third
// argument to api.get/post/delete — it gets appended as a query param.
// The accountId comes from account.id in AuthContext.
// -------------------------------------------------------------------

// ── Watchlist ────────────────────────────────────────────────────

export function getWatchlist(accountId, sessionId, mediaType = "movies", page = 1) {
  return api.get(
    `/account/${accountId}/watchlist/${mediaType}`,
    { page, sort_by: "created_at.desc" },
    sessionId
  );
}

export function addToWatchlist(accountId, sessionId, mediaType, mediaId) {
  return api.post(
    `/account/${accountId}/watchlist`,
    { media_type: mediaType, media_id: mediaId, watchlist: true },
    sessionId
  );
}

export function removeFromWatchlist(accountId, sessionId, mediaType, mediaId) {
  return api.post(
    `/account/${accountId}/watchlist`,
    { media_type: mediaType, media_id: mediaId, watchlist: false },
    sessionId
  );
}

// ── Favorites ───────────────────────────────────────────────────

export function getFavorites(accountId, sessionId, mediaType = "movies", page = 1) {
  return api.get(
    `/account/${accountId}/favorite/${mediaType}`,
    { page, sort_by: "created_at.desc" },
    sessionId
  );
}

export function addToFavorites(accountId, sessionId, mediaType, mediaId) {
  return api.post(
    `/account/${accountId}/favorite`,
    { media_type: mediaType, media_id: mediaId, favorite: true },
    sessionId
  );
}

export function removeFromFavorites(accountId, sessionId, mediaType, mediaId) {
  return api.post(
    `/account/${accountId}/favorite`,
    { media_type: mediaType, media_id: mediaId, favorite: false },
    sessionId
  );
}

// ── Ratings ─────────────────────────────────────────────────────

export function getRatedMovies(accountId, sessionId, page = 1) {
  return api.get(
    `/account/${accountId}/rated/movies`,
    { page, sort_by: "created_at.desc" },
    sessionId
  );
}

export function rateMovie(sessionId, movieId, value) {
  // value: 0.5–10 in increments of 0.5
  return api.post(`/movie/${movieId}/rating`, { value }, sessionId);
}

export function deleteMovieRating(sessionId, movieId) {
  return api.delete(`/movie/${movieId}/rating`, {}, sessionId);
}

// ── Account state (are items in watchlist/favorites?) ───────────

export function getMovieAccountStates(movieId, sessionId) {
  return api.get(`/movie/${movieId}/account_states`, {}, sessionId);
}

export function getTvAccountStates(tvId, sessionId) {
  return api.get(`/tv/${tvId}/account_states`, {}, sessionId);
}
