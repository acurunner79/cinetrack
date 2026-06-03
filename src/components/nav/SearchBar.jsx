import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSearch } from "../../hooks/useSearch";
import { posterUrl, profileUrl, placeholders } from "../../utils/tmdbImage";

function ResultRow({ item, onSelect }) {
  const isMovie  = item.media_type === "movie";
  const isTv     = item.media_type === "tv";
  const isPerson = item.media_type === "person";

  const title    = isMovie ? item.title : item.name;
  const year     = isMovie
    ? item.release_date?.slice(0, 4)
    : isTv
    ? item.first_air_date?.slice(0, 4)
    : item.known_for_department;

  const href     = isMovie
    ? `/movies/${item.id}`
    : isTv
    ? `/tv/${item.id}`
    : `/people/${item.id}`;

  const imgSrc   = isPerson
    ? profileUrl(item.profile_path, "sm")
    : posterUrl(item.poster_path, "sm");

  const placeholder = isPerson ? placeholders.profile : placeholders.poster;

  const typeLabel = isMovie ? "Movie" : isTv ? "TV" : "Person";

  return (
    <button className="searchbar-result-row" onClick={() => onSelect(href)}>
      <img
        src={imgSrc ?? placeholder}
        alt={title}
        className={`searchbar-result-img ${isPerson ? "searchbar-result-img--round" : ""}`}
        onError={(e) => { e.target.src = placeholder; }}
      />
      <div className="searchbar-result-info">
        <span className="searchbar-result-title">{title}</span>
        {year && <span className="searchbar-result-sub">{year}</span>}
      </div>
      <span className="searchbar-result-type">{typeLabel}</span>
    </button>
  );
}

export default function SearchBar() {
  const [query, setQuery]       = useState("");
  const [open, setOpen]         = useState(false);
  const [focused, setFocused]   = useState(false);
  const inputRef                = useRef(null);
  const containerRef            = useRef(null);
  const navigate                = useNavigate();

  const { results, loading }    = useSearch(query);
  const showDropdown            = focused && query.trim().length > 0;
  const preview                 = results.slice(0, 6);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e) {
      if (!containerRef.current?.contains(e.target)) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handler(e) {
      if (e.key === "Escape") {
        setFocused(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setFocused(false);
    inputRef.current?.blur();
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  }, [query, navigate]);

  const handleSelect = useCallback((href) => {
    setFocused(false);
    setQuery("");
    navigate(href);
  }, [navigate]);

  const handleSeeAll = useCallback(() => {
    if (!query.trim()) return;
    setFocused(false);
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  }, [query, navigate]);

  return (
    <div className="searchbar" ref={containerRef}>
      <form onSubmit={handleSubmit} className="searchbar-form" role="search">
        <span className="searchbar-icon" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </span>
        <input
          ref={inputRef}
          type="search"
          placeholder="Search movies, TV, people…"
          className="searchbar-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          autoComplete="off"
          aria-label="Search"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
        />
        {query && (
          <button
            type="button"
            className="searchbar-clear"
            onClick={() => { setQuery(""); inputRef.current?.focus(); }}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </form>

      {showDropdown && (
        <div className="searchbar-dropdown" role="listbox">
          {loading && (
            <div className="searchbar-dropdown-state">Searching…</div>
          )}

          {!loading && preview.length === 0 && (
            <div className="searchbar-dropdown-state">No results for "{query}"</div>
          )}

          {!loading && preview.map((item) => (
            <ResultRow key={`${item.media_type}-${item.id}`} item={item} onSelect={handleSelect} />
          ))}

          {!loading && results.length > 6 && (
            <button className="searchbar-see-all" onClick={handleSeeAll}>
              See all {results.length}+ results for "{query}"
            </button>
          )}
        </div>
      )}
    </div>
  );
}
