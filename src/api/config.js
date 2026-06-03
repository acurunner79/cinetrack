import { api } from "./client";
import { STORAGE_KEYS } from "../constants/tmdb";

const CONFIG_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours — TMDb rarely changes this

// -------------------------------------------------------------------
// Shape returned by GET /configuration
// {
//   images: {
//     base_url: "http://image.tmdb.org/t/p/",
//     secure_base_url: "https://image.tmdb.org/t/p/",
//     backdrop_sizes: ["w300","w780","w1280","original"],
//     poster_sizes:   ["w92","w154","w185","w342","w500","w780","original"],
//     profile_sizes:  ["w45","w185","h632","original"],
//     logo_sizes:     ["w45","w92","w154","w185","w300","w500","original"],
//     still_sizes:    ["w92","w185","w300","original"],
//   },
//   change_keys: [...]
// }
// -------------------------------------------------------------------

function readCache() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.config);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > CONFIG_TTL_MS) return null;
    return data;
  } catch {
    return null;
  }
}

function writeCache(data) {
  try {
    localStorage.setItem(
      STORAGE_KEYS.config,
      JSON.stringify({ data, timestamp: Date.now() })
    );
  } catch {
    // localStorage may be full; non-fatal
  }
}

// Module-level promise so concurrent callers share one in-flight request
let _inflight = null;

export async function fetchConfig() {
  // 1. Memory: already fetched this session
  if (_inflight) return _inflight;

  // 2. Cache: fresh enough from a previous session
  const cached = readCache();
  if (cached) return cached;

  // 3. Network: fetch and cache
  _inflight = api.get("/configuration").then((data) => {
    writeCache(data);
    _inflight = data; // replace promise with resolved value for future callers
    return data;
  });

  return _inflight;
}

// Returns just the images sub-object — what tmdbImage.js needs
export async function getImageConfig() {
  const config = await fetchConfig();
  return config.images;
}
