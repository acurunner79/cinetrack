import { TMDB_V3_BASE, TMDB_V4_BASE } from "../constants/tmdb";

// -------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------

function getApiKey() {
  return import.meta.env.VITE_TMDB_API_KEY;
}

function getReadToken() {
  return import.meta.env.VITE_TMDB_READ_TOKEN;
}

// -------------------------------------------------------------------
// Custom error class so callers can distinguish TMDb errors from
// network failures and handle status codes specifically (e.g. 401).
// -------------------------------------------------------------------
export class TmdbError extends Error {
  constructor(message, statusCode, statusMessage) {
    super(message);
    this.name = "TmdbError";
    this.statusCode = statusCode;
    this.statusMessage = statusMessage;
  }
}

// -------------------------------------------------------------------
// Core fetch wrapper
//
// version: "v3" | "v4"
// endpoint: path string e.g. "/movie/550"
// options: RequestInit overrides + { params } for query string
// sessionId: optional – appended to v3 requests that need user auth
// -------------------------------------------------------------------
async function tmdbFetch(version, endpoint, options = {}, sessionId = null) {
  const base = version === "v4" ? TMDB_V4_BASE : TMDB_V3_BASE;

  const { params = {}, ...fetchOptions } = options;

  // v3 uses API key + optional session_id as query params
  // v4 uses Bearer token in the Authorization header
  const searchParams = new URLSearchParams(params);

  if (version === "v3") {
    searchParams.set("api_key", getApiKey());
    if (sessionId) searchParams.set("session_id", sessionId);
  }

  const url = `${base}${endpoint}?${searchParams.toString()}`;

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(version === "v4" && {
      Authorization: `Bearer ${getReadToken()}`,
    }),
    ...fetchOptions.headers,
  };

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  // TMDb returns error details in the JSON body even on non-2xx
  if (!response.ok) {
    let errorBody = {};
    try {
      errorBody = await response.json();
    } catch {
      // ignore parse failures on error responses
    }
    throw new TmdbError(
      errorBody.status_message || `HTTP ${response.status}`,
      response.status,
      errorBody.status_message
    );
  }

  return response.json();
}

// -------------------------------------------------------------------
// Public API – convenience wrappers for each HTTP verb
// All return parsed JSON or throw TmdbError
// -------------------------------------------------------------------

export const api = {
  /** GET /v3/<endpoint> */
  get(endpoint, params = {}, sessionId = null) {
    return tmdbFetch("v3", endpoint, { method: "GET", params }, sessionId);
  },

  /** POST /v3/<endpoint> */
  post(endpoint, body = {}, sessionId = null) {
    return tmdbFetch(
      "v3",
      endpoint,
      { method: "POST", body: JSON.stringify(body) },
      sessionId
    );
  },

  /** DELETE /v3/<endpoint> */
  delete(endpoint, body = {}, sessionId = null) {
    return tmdbFetch(
      "v3",
      endpoint,
      { method: "DELETE", body: JSON.stringify(body) },
      sessionId
    );
  },

  /** GET /v4/<endpoint> – uses Bearer token auth */
  v4get(endpoint, params = {}) {
    return tmdbFetch("v4", endpoint, { method: "GET", params });
  },

  /** POST /v4/<endpoint> – uses Bearer token auth */
  v4post(endpoint, body = {}) {
    return tmdbFetch("v4", endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
};
