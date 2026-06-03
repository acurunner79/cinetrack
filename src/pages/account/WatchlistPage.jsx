import { useState } from "react";
import { Link } from "react-router-dom";
import { useWatchlist } from "../../context/WatchlistContext";
import {
  posterUrl,
  posterSrcSet,
  backdropUrl,
  placeholders,
} from "../../utils/tmdbImage";
import RatingBadge from "../../components/common/RatingBadge";
import WatchlistButton from "../../components/common/WatchlistButton";
import Spinner from "../../components/common/Spinner";

function WatchlistCard({ item, mediaType }) {
  const title    = mediaType === "movie" ? item.title : item.name;
  const year     = (mediaType === "movie"
    ? item.release_date
    : item.first_air_date)?.slice(0, 4);
  const href     = mediaType === "movie" ? `/movies/${item.id}` : `/tv/${item.id}`;
  const overview = item.overview;

  return (
    <div className="wl-card">
      {/* Backdrop strip */}
      <div
        className="wl-card-backdrop"
        style={{
          backgroundImage: item.backdrop_path
            ? `url(${backdropUrl(item.backdrop_path, "sm")})`
            : "none",
        }}
      >
        <div className="wl-card-backdrop-overlay" />
      </div>

      {/* Poster */}
      <Link to={href} className="wl-card-poster-wrap">
        <img
          src={posterUrl(item.poster_path, "sm") ?? placeholders.poster}
          srcSet={posterSrcSet(item.poster_path)}
          sizes="92px"
          alt={title}
          loading="lazy"
          onError={(e) => { e.target.src = placeholders.poster; }}
          className="wl-card-poster"
        />
      </Link>

      {/* Info */}
      <div className="wl-card-info">
        <div className="wl-card-meta">
          {year && <span className="wl-card-year">{year}</span>}
          {item.vote_average > 0 && <RatingBadge value={item.vote_average} />}
        </div>
        <Link to={href} className="wl-card-title">{title}</Link>
        {overview && <p className="wl-card-overview">{overview}</p>}
      </div>

      {/* Remove button */}
      <div className="wl-card-actions">
        <WatchlistButton mediaType={mediaType} mediaId={item.id} size="md" />
      </div>
    </div>
  );
}

function EmptyState({ mediaType }) {
  return (
    <div className="wl-empty">
      <p className="wl-empty-title">
        No {mediaType === "movie" ? "movies" : "TV shows"} in your watchlist yet
      </p>
      <p className="wl-empty-sub">
        Hit the <strong>+</strong> on any card to save it here
      </p>
      <Link
        to={mediaType === "movie" ? "/movies" : "/tv"}
        className="wl-empty-cta"
      >
        Browse {mediaType === "movie" ? "movies" : "TV shows"} →
      </Link>
    </div>
  );
}

export default function WatchlistPage() {
  const [tab, setTab] = useState("movie");
  const { movies, tv, loading, error } = useWatchlist();

  const items = tab === "movie" ? movies : tv;

  return (
    <div className="wl-page">
      <div className="wl-header">
        <h1 className="wl-title">My Watchlist</h1>
        <p className="wl-count">
          {movies.length} {movies.length === 1 ? "movie" : "movies"} · {tv.length} TV {tv.length === 1 ? "show" : "shows"}
        </p>
      </div>

      {/* Tabs */}
      <div className="wl-tabs">
        <button
          className={`wl-tab ${tab === "movie" ? "wl-tab--active" : ""}`}
          onClick={() => setTab("movie")}
        >
          Movies
          {movies.length > 0 && (
            <span className="wl-tab-count">{movies.length}</span>
          )}
        </button>
        <button
          className={`wl-tab ${tab === "tv" ? "wl-tab--active" : ""}`}
          onClick={() => setTab("tv")}
        >
          TV Shows
          {tv.length > 0 && (
            <span className="wl-tab-count">{tv.length}</span>
          )}
        </button>
      </div>

      {/* Content */}
      {loading && (
        <div style={{ padding: "4rem 0" }}>
          <Spinner size="lg" label="Loading watchlist…" />
        </div>
      )}

      {error && (
        <div className="wl-error">Could not load your watchlist — {error}</div>
      )}

      {!loading && !error && items.length === 0 && (
        <EmptyState mediaType={tab} />
      )}

      {!loading && !error && items.length > 0 && (
        <div className="wl-list">
          {items.map((item) => (
            <WatchlistCard key={item.id} item={item} mediaType={tab} />
          ))}
        </div>
      )}
    </div>
  );
}
