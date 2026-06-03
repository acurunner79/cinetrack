import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTmdb } from "../../hooks/useTmdb";
import MediaCard from "../../components/common/MediaCard";
import Spinner from "../../components/common/Spinner";

// Sort options available for both movies and TV
const SORT_OPTIONS = [
  { value: "popularity.desc",        label: "Most popular" },
  { value: "vote_average.desc",      label: "Top rated" },
  { value: "primary_release_date.desc", label: "Newest first",  movieOnly: true },
  { value: "first_air_date.desc",    label: "Newest first",  tvOnly: true },
  { value: "primary_release_date.asc",  label: "Oldest first", movieOnly: true },
  { value: "first_air_date.asc",     label: "Oldest first", tvOnly: true },
  { value: "revenue.desc",           label: "Highest grossing", movieOnly: true },
];

// -------------------------------------------------------------------
// BrowsePage — used by both /movies and /tv
//
// Props:
//   mediaType   "movie" | "tv"
//   title       "Movies" | "TV Shows"
//   fetchFn     (params) => Promise  — discoverMovies or discoverTv
//   genresFn    () => Promise        — getMovieGenres or getTvGenres
// -------------------------------------------------------------------
export default function BrowsePage({ mediaType, title, fetchFn, genresFn }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const sort    = searchParams.get("sort")  || "popularity.desc";
  const genre   = searchParams.get("genre") || "";
  const page    = parseInt(searchParams.get("page") || "1", 10);

  // Fetch genres once
  const { data: genreData } = useTmdb(() => genresFn(), []);
  const genres = genreData?.genres ?? [];

  // Fetch results whenever filters change
  const { data, loading, error } = useTmdb(() => {
    const params = { sort_by: sort, page };
    if (genre) params.with_genres = genre;
    // Require minimum votes for top rated so obscure titles don't dominate
    if (sort === "vote_average.desc") params["vote_count.gte"] = 200;
    return fetchFn(params);
  }, [sort, genre, page]);

  const results    = data?.results ?? [];
  const totalPages = Math.min(data?.total_pages ?? 0, 500);

  function setParam(key, value) {
    const next = new URLSearchParams(searchParams);
    next.set(key, value);
    if (key !== "page") next.set("page", "1");
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const sortOptions = SORT_OPTIONS.filter(
    (o) => !o.movieOnly && !o.tvOnly
      || (mediaType === "movie" && o.movieOnly)
      || (mediaType === "tv"    && o.tvOnly)
      || (!o.movieOnly && !o.tvOnly)
  );

  return (
    <div className="browse-page">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="browse-header">
        <h1 className="browse-title">{title}</h1>
        {data?.total_results > 0 && (
          <p className="browse-count">
            {data.total_results.toLocaleString()} titles
          </p>
        )}
      </div>

      {/* ── Filters ─────────────────────────────────────────────── */}
      <div className="browse-filters">
        {/* Sort */}
        <div className="browse-filter-group">
          <label className="browse-filter-label" htmlFor="sort-select">Sort</label>
          <select
            id="sort-select"
            className="browse-select"
            value={sort}
            onChange={(e) => setParam("sort", e.target.value)}
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Genre */}
        <div className="browse-filter-group">
          <label className="browse-filter-label" htmlFor="genre-select">Genre</label>
          <select
            id="genre-select"
            className="browse-select"
            value={genre}
            onChange={(e) => setParam("genre", e.target.value)}
          >
            <option value="">All genres</option>
            {genres.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>

        {/* Active filter pills */}
        {(genre || sort !== "popularity.desc") && (
          <button
            className="browse-clear"
            onClick={() => setSearchParams({})}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Genre pills (quick-select) */}
      {genres.length > 0 && (
        <div className="browse-genre-pills">
          <button
            className={`browse-genre-pill ${!genre ? "browse-genre-pill--active" : ""}`}
            onClick={() => setParam("genre", "")}
          >
            All
          </button>
          {genres.map((g) => (
            <button
              key={g.id}
              className={`browse-genre-pill ${genre === String(g.id) ? "browse-genre-pill--active" : ""}`}
              onClick={() => setParam("genre", String(g.id))}
            >
              {g.name}
            </button>
          ))}
        </div>
      )}

      {/* ── Results ─────────────────────────────────────────────── */}
      {loading && (
        <div className="browse-state">
          <Spinner size="lg" />
        </div>
      )}

      {error && (
        <div className="browse-state browse-state--error">
          Something went wrong — {error}
        </div>
      )}

      {!loading && !error && results.length === 0 && (
        <div className="browse-state">No results found.</div>
      )}

      {!loading && !error && results.length > 0 && (
        <div className="browse-grid">
          {results.map((item) => (
            <MediaCard key={item.id} item={item} type={mediaType} />
          ))}
        </div>
      )}

      {/* ── Pagination ──────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="search-pagination">
          <button
            className="search-page-btn"
            onClick={() => setParam("page", String(page - 1))}
            disabled={page <= 1}
          >
            ← Prev
          </button>
          <span className="search-page-info">
            Page {page} of {totalPages.toLocaleString()}
          </span>
          <button
            className="search-page-btn"
            onClick={() => setParam("page", String(page + 1))}
            disabled={page >= totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
