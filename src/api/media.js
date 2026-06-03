import { api } from "./client";

// -------------------------------------------------------------------
// Trending
// mediaType: "all" | "movie" | "tv" | "person"
// timeWindow: "day" | "week"
// -------------------------------------------------------------------
export function getTrending(mediaType = "all", timeWindow = "day") {
  return api.get(`/trending/${mediaType}/${timeWindow}`);
}

// -------------------------------------------------------------------
// Movies
// -------------------------------------------------------------------
export function getNowPlaying(page = 1) {
  return api.get("/movie/now_playing", { page });
}

export function getTopRatedMovies(page = 1) {
  return api.get("/movie/top_rated", { page });
}

export function getUpcomingMovies(page = 1) {
  return api.get("/movie/upcoming", { page });
}

// -------------------------------------------------------------------
// TV
// -------------------------------------------------------------------
export function getAiringToday(page = 1) {
  return api.get("/tv/airing_today", { page });
}

export function getTopRatedTv(page = 1) {
  return api.get("/tv/top_rated", { page });
}

// -------------------------------------------------------------------
// Movie detail (used by detail page later)
// append_to_response packs multiple sub-requests into one call
// -------------------------------------------------------------------
export function getMovie(movieId, append = "") {
  const params = append ? { append_to_response: append } : {};
  return api.get(`/movie/${movieId}`, params);
}

export function getTv(tvId, append = "") {
  const params = append ? { append_to_response: append } : {};
  return api.get(`/tv/${tvId}`, params);
}

export function getSeason(tvId, seasonNumber) {
  return api.get(`/tv/${tvId}/season/${seasonNumber}`);
}

export function getEpisode(tvId, seasonNumber, episodeNumber) {
  return api.get(`/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`);
}

// -------------------------------------------------------------------
// Discover — flexible filter + sort for browse pages
// params: { sort_by, with_genres, page, ... }
// -------------------------------------------------------------------
export function discoverMovies(params = {}) {
  return api.get("/discover/movie", { page: 1, ...params });
}

export function discoverTv(params = {}) {
  return api.get("/discover/tv", { page: 1, ...params });
}

// Genre lists (call once, cache in component)
export function getMovieGenres() {
  return api.get("/genre/movie/list");
}

export function getTvGenres() {
  return api.get("/genre/tv/list");
}
export function getPerson(personId, append = "") {
  const params = append ? { append_to_response: append } : {};
  return api.get(`/person/${personId}`, params);
}
