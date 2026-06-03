import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useTmdb } from "../../hooks/useTmdb";
import { searchMulti, searchMovies, searchTv, searchPeople } from "../../api/search";
import MediaCard from "../../components/common/MediaCard";
import Spinner from "../../components/common/Spinner";

const TABS = [
  { key: "all",    label: "All" },
  { key: "movie",  label: "Movies" },
  { key: "tv",     label: "TV" },
  { key: "person", label: "People" },
];

function fetchForTab(tab, query, page) {
  switch (tab) {
    case "movie":  return searchMovies(query, page);
    case "tv":     return searchTv(query, page);
    case "person": return searchPeople(query, page);
    default:       return searchMulti(query, page);
  }
}

// Normalise person results so MediaCard gets media_type
function normalise(results, tab) {
  if (tab === "all") return results;
  return results.map((r) => ({ ...r, media_type: tab }));
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query   = searchParams.get("q") ?? "";
  const tab     = searchParams.get("tab") ?? "all";
  const page    = parseInt(searchParams.get("page") ?? "1", 10);

  const { data, loading, error } = useTmdb(
    () => fetchForTab(tab, query, page),
    [tab, query, page]
  );

  const results     = normalise(data?.results ?? [], tab);
  const totalPages  = Math.min(data?.total_pages ?? 0, 500); // TMDb caps at 500
  const totalResults = data?.total_results ?? 0;

  function setTab(t) {
    setSearchParams({ q: query, tab: t, page: "1" });
  }

  function setPage(p) {
    setSearchParams({ q: query, tab, page: String(p) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!query) {
    return (
      <div className="search-empty">
        <p>Start typing in the search bar to find movies, TV shows, and people.</p>
      </div>
    );
  }

  return (
    <div className="search-page">
      <div className="search-header">
        <h1 className="search-title">
          Results for <em>"{query}"</em>
        </h1>
        {totalResults > 0 && (
          <p className="search-count">
            {totalResults.toLocaleString()} result{totalResults !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="search-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            className={`search-tab ${tab === t.key ? "search-tab--active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Results grid */}
      {loading && (
        <div className="search-state">
          <Spinner size="lg" />
        </div>
      )}

      {error && (
        <div className="search-state search-state--error">
          Something went wrong — {error}
        </div>
      )}

      {!loading && !error && results.length === 0 && (
        <div className="search-state">
          No {tab === "all" ? "" : tab} results for "{query}"
        </div>
      )}

      {!loading && !error && results.length > 0 && (
        <div className="search-grid">
          {results.map((item) => (
            <MediaCard
              key={`${item.media_type ?? tab}-${item.id}`}
              item={item}
              type={tab === "all" ? undefined : tab}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="search-pagination">
          <button
            className="search-page-btn"
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
          >
            ← Prev
          </button>

          <span className="search-page-info">
            Page {page} of {totalPages.toLocaleString()}
          </span>

          <button
            className="search-page-btn"
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
