export const TMDB_V3_BASE = "https://api.themoviedb.org/3";
export const TMDB_V4_BASE = "https://api.themoviedb.org/4";
export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

// Poster sizes: w92, w154, w185, w342, w500, w780, original
// Backdrop sizes: w300, w780, w1280, original
// Profile sizes: w45, w185, h632, original
export const IMAGE_SIZES = {
  poster: { sm: "w185", md: "w342", lg: "w500", xl: "w780" },
  backdrop: { sm: "w300", md: "w780", lg: "w1280", xl: "original" },
  profile: { sm: "w45", md: "w185", lg: "h632" },
  logo: { sm: "w45", md: "w92", lg: "w154", xl: "w185" },
};

// Auth endpoints (v3 flow)
export const AUTH_ENDPOINTS = {
  requestToken: "/authentication/token/new",
  validateToken: "/authentication/token/validate_with_login",
  createSession: "/authentication/session/new",
  deleteSession: "/authentication/session",
  account: "/account",
};

// TMDb redirect URL for user approval step
export const TMDB_AUTH_URL = "https://www.themoviedb.org/authenticate";

// localStorage keys
export const STORAGE_KEYS = {
  sessionId: "tmdb_session_id",
  accountId: "tmdb_account_id",
  requestToken: "tmdb_request_token",
  config: "tmdb_config",
};
