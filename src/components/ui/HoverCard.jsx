import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { backdropUrl, posterUrl, placeholders } from "../../utils/tmdbImage";
import RatingBadge from "../common/RatingBadge";
import WatchlistButton from "../common/WatchlistButton";
import TrailerModal from "./TrailerModal";
import { useTmdb } from "../../hooks/useTmdb";
import { getMovie, getTv } from "../../api/media";

export default function HoverCard({ item, type, anchor }) {
  const mediaType = type || item.media_type;
  const isMovie   = mediaType === "movie";
  const isPerson  = mediaType === "person";
  const navigate  = useNavigate();
  const [trailerKey, setTrailerKey] = useState(null);

  const title    = isMovie ? item.title : item.name;
  const year     = (isMovie ? item.release_date : item.first_air_date)?.slice(0, 4);
  const overview = item.overview;
  const href     = isPerson
    ? `/people/${item.id}`
    : isMovie ? `/movies/${item.id}` : `/tv/${item.id}`;

  // Lazily fetch videos when the hover card appears
  const { data: detail } = useTmdb(
    () => {
      if (isPerson || !item.id) return Promise.resolve(null);
      return isMovie ? getMovie(item.id, "videos") : getTv(item.id, "videos");
    },
    [item.id, isMovie, isPerson]
  );

  const trailer = detail?.videos?.results?.find(
    (v) => v.site === "YouTube" && v.type === "Trailer" && v.official
  ) ?? detail?.videos?.results?.find(
    (v) => v.site === "YouTube" && v.type === "Trailer"
  ) ?? detail?.videos?.results?.find(
    (v) => v.site === "YouTube"
  );

  const style = anchor ? getCardPosition(anchor) : {};

  return (
    <>
      <div className="hover-card" style={style}>
        {/* Backdrop */}
        <div className="hover-card-backdrop-wrap">
          <img
            src={
              backdropUrl(item.backdrop_path, "sm") ??
              posterUrl(item.poster_path, "md") ??
              placeholders.poster
            }
            alt={title}
            className="hover-card-backdrop"
            onError={(e) => { e.target.src = placeholders.poster; }}
          />
          <div className="hover-card-backdrop-overlay" />

          {/* Play / view details button */}
          <button
            className="hover-card-play"
            onClick={() => navigate(href)}
            aria-label={`View ${title}`}
          >
            <span className="hover-card-play-icon">▶</span>
          </button>
        </div>

        {/* Info */}
        <div className="hover-card-body">
          <div className="hover-card-top">
            <p className="hover-card-title">{title}</p>
            <div className="hover-card-actions">
              {(mediaType === "movie" || mediaType === "tv") && (
                <WatchlistButton mediaType={mediaType} mediaId={item.id} size="sm" />
              )}
            </div>
          </div>

          <div className="hover-card-meta">
            {item.vote_average > 0 && <RatingBadge value={item.vote_average} />}
            {year && <span className="hover-card-year">{year}</span>}
          </div>

          {overview && <p className="hover-card-overview">{overview}</p>}

          {/* Trailer button — appears once videos are fetched */}
          {trailer && (
            <button
              className="hover-card-trailer-btn"
              onClick={() => setTrailerKey(trailer.key)}
            >
              <span className="hover-card-trailer-icon">◉</span>
              Watch Trailer
            </button>
          )}
        </div>
      </div>

      {/* Trailer modal — rendered outside hover card so it's not clipped */}
      {trailerKey && (
        <TrailerModal
          videoKey={trailerKey}
          title={title}
          onClose={() => setTrailerKey(null)}
        />
      )}
    </>
  );
}

function getCardPosition(anchor) {
  const rect   = anchor.getBoundingClientRect();
  const cardW  = 320;
  const scrollY = window.scrollY;

  let left = rect.left + rect.width / 2 - cardW / 2;
  left = Math.max(12, Math.min(left, window.innerWidth - cardW - 12));

  const top = rect.top + scrollY - 8;

  return { position: "absolute", top, left, width: cardW, zIndex: 200 };
}
