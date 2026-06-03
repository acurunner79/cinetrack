import { api } from "./client";

// Multi-search — returns movies, TV shows, and people in one call
export function searchMulti(query, page = 1) {
  if (!query?.trim()) return Promise.resolve({ results: [], total_results: 0, total_pages: 0 });
  return api.get("/search/multi", { query: query.trim(), page, include_adult: false });
}

// Type-specific searches — used for filtered results tabs
export function searchMovies(query, page = 1) {
  if (!query?.trim()) return Promise.resolve({ results: [], total_results: 0, total_pages: 0 });
  return api.get("/search/movie", { query: query.trim(), page, include_adult: false });
}

export function searchTv(query, page = 1) {
  if (!query?.trim()) return Promise.resolve({ results: [], total_results: 0, total_pages: 0 });
  return api.get("/search/tv", { query: query.trim(), page, include_adult: false });
}

export function searchPeople(query, page = 1) {
  if (!query?.trim()) return Promise.resolve({ results: [], total_results: 0, total_pages: 0 });
  return api.get("/search/person", { query: query.trim(), page, include_adult: false });
}
