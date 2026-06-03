import { useWatchlist } from "../../context/WatchlistContext";

// size: "sm" (card overlay) | "md" (default) | "lg" (detail page)
export default function WatchlistButton({ mediaType, mediaId, size = "md", className = "" }) {
  const { isInWatchlist, isPending, toggle } = useWatchlist();

  const inList  = isInWatchlist(mediaType, mediaId);
  const pending = isPending(mediaType, mediaId);

  function handleClick(e) {
    // Stop propagation so clicks don't trigger parent Link navigation
    e.preventDefault();
    e.stopPropagation();
    toggle(mediaType, mediaId);
  }

  const label = inList ? "Remove from watchlist" : "Add to watchlist";

  return (
    <button
      className={`watchlist-btn watchlist-btn--${size} ${inList ? "watchlist-btn--active" : ""} ${pending ? "watchlist-btn--pending" : ""} ${className}`}
      onClick={handleClick}
      aria-label={label}
      title={label}
      disabled={pending}
    >
      {pending ? (
        <span className="watchlist-btn-icon watchlist-btn-icon--spin">⟳</span>
      ) : inList ? (
        <span className="watchlist-btn-icon">✓</span>
      ) : (
        <span className="watchlist-btn-icon">+</span>
      )}
      {size !== "sm" && (
        <span className="watchlist-btn-label">
          {pending ? "Saving…" : inList ? "In watchlist" : "Add to watchlist"}
        </span>
      )}
    </button>
  );
}
