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
