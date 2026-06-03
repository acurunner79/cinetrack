import { TMDB_IMAGE_BASE, IMAGE_SIZES } from "../constants/tmdb";
import { getImageConfig } from "../api/config";

// -------------------------------------------------------------------
// TMDb images work like this:
//   full URL = secure_base_url + size + file_path
//   e.g. https://image.tmdb.org/t/p/w500/abc123.jpg
//
// The secure_base_url and available sizes come from /configuration.
// We fall back to the hardcoded TMDB_IMAGE_BASE if config hasn't
// loaded yet so nothing breaks on first render.
// -------------------------------------------------------------------

let _imageBaseUrl = `${TMDB_IMAGE_BASE}/`; // fallback

// Called once at app startup by ConfigProvider (below).
// After this, all sync helpers use the confirmed base URL.
export function setImageBaseUrl(secureBaseUrl) {
  _imageBaseUrl = secureBaseUrl;
}

// -------------------------------------------------------------------
// Core builder — synchronous once config is loaded
// -------------------------------------------------------------------
function buildUrl(path, size) {
  if (!path) return null;
  // Some paths already include the full URL (e.g. Gravatar avatars)
  if (path.startsWith("http")) return path;
  return `${_imageBaseUrl}${size}${path}`;
}

// -------------------------------------------------------------------
// Typed helpers — use these in components
// Each accepts a `path` (e.g. "/abc123.jpg") and an optional size key
// -------------------------------------------------------------------

export function posterUrl(path, size = "md") {
  return buildUrl(path, IMAGE_SIZES.poster[size] ?? IMAGE_SIZES.poster.md);
}

export function backdropUrl(path, size = "lg") {
  return buildUrl(path, IMAGE_SIZES.backdrop[size] ?? IMAGE_SIZES.backdrop.lg);
}

export function profileUrl(path, size = "md") {
  return buildUrl(path, IMAGE_SIZES.profile[size] ?? IMAGE_SIZES.profile.md);
}

export function logoUrl(path, size = "md") {
  return buildUrl(path, IMAGE_SIZES.logo[size] ?? IMAGE_SIZES.logo.md);
}

export function stillUrl(path, size = "md") {
  // Episode stills: w92, w185, w300, original
  const stillSizes = { sm: "w92", md: "w185", lg: "w300", xl: "original" };
  return buildUrl(path, stillSizes[size] ?? stillSizes.md);
}

// -------------------------------------------------------------------
// Responsive srcSet builder
// Generates a srcSet string for <img srcSet="..."> so the browser
// picks the best size for the device pixel ratio / layout width.
//
// Usage:
//   <img
//     src={posterUrl(path, "md")}
//     srcSet={posterSrcSet(path)}
//     sizes="(max-width: 600px) 185px, 342px"
//   />
// -------------------------------------------------------------------

export function posterSrcSet(path) {
  if (!path) return undefined;
  return [
    `${buildUrl(path, IMAGE_SIZES.poster.sm)} 185w`,
    `${buildUrl(path, IMAGE_SIZES.poster.md)} 342w`,
    `${buildUrl(path, IMAGE_SIZES.poster.lg)} 500w`,
    `${buildUrl(path, IMAGE_SIZES.poster.xl)} 780w`,
  ].join(", ");
}

export function backdropSrcSet(path) {
  if (!path) return undefined;
  return [
    `${buildUrl(path, IMAGE_SIZES.backdrop.sm)} 300w`,
    `${buildUrl(path, IMAGE_SIZES.backdrop.md)} 780w`,
    `${buildUrl(path, IMAGE_SIZES.backdrop.lg)} 1280w`,
  ].join(", ");
}

// -------------------------------------------------------------------
// Placeholder helpers — used when TMDb has no image for an item
// Returns a data URI for a minimal SVG so <img> never shows a
// broken-image icon.
// -------------------------------------------------------------------

const PLACEHOLDER_POSTER = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 150 225'%3E%3Crect width='150' height='225' fill='%23222'/%3E%3Ctext x='75' y='118' text-anchor='middle' fill='%23555' font-size='40'%3E%3F%3C/text%3E%3C/svg%3E`;

const PLACEHOLDER_BACKDROP = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 169'%3E%3Crect width='300' height='169' fill='%23222'/%3E%3C/svg%3E`;

const PLACEHOLDER_PROFILE = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 150'%3E%3Crect width='100' height='150' fill='%23222'/%3E%3Ccircle cx='50' cy='55' r='22' fill='%23444'/%3E%3Cellipse cx='50' cy='110' rx='32' ry='22' fill='%23444'/%3E%3C/svg%3E`;

export const placeholders = {
  poster: PLACEHOLDER_POSTER,
  backdrop: PLACEHOLDER_BACKDROP,
  profile: PLACEHOLDER_PROFILE,
};

// -------------------------------------------------------------------
// ConfigProvider — fetches /configuration once at app startup and
// sets the confirmed base URL so all sync helpers are accurate.
//
// Wrap this around your app in main.jsx or App.jsx:
//   <ConfigProvider>
//     <AuthProvider> ... </AuthProvider>
//   </ConfigProvider>
// -------------------------------------------------------------------
import { useEffect } from "react";

export function ConfigProvider({ children }) {
  useEffect(() => {
    getImageConfig()
      .then((images) => {
        if (images?.secure_base_url) {
          setImageBaseUrl(images.secure_base_url);
        }
      })
      .catch(() => {
        // Non-fatal — fallback URL is already set
      });
  }, []);

  // Renders children immediately; images will use the fallback URL
  // for the first render, then the confirmed URL once config loads.
  // In practice this is imperceptible since config resolves in <100ms.
  return children;
}
