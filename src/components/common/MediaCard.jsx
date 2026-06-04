import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { posterUrl, profileUrl, posterSrcSet, placeholders } from "../../utils/tmdbImage";
import RatingBadge from "./RatingBadge";
import WatchlistButton from "./WatchlistButton";
import TrailerModal from "../ui/TrailerModal";
import { useTmdb } from "../../hooks/useTmdb";
import { getMovie, getTv } from "../../api/media";

function deriveMedia(item, type) {
  const mediaType = type || item.media_type;

  if (mediaType === "person") {
    return {
      href:        `/people/${item.id}`,
      title:       item.name,
      subtitle:    item.known_for_department,
      imageUrl:    profileUrl(item.profile_path, "md"),
      srcSet:      null,
      placeholder: placeholders.profile,
      rating:      null,
      mediaType:   "person",
    };
  }

  const isMovie = mediaType === "movie";
  return {
    href:        isMovie ? `/movies/${item.id}` : `/tv/${item.id}`,
    title:       isMovie ? item.title : item.name,
    subtitle:    isMovie ? item.release_date?.slice(0, 4) : item.first_air_date?.slice(0, 4),
    imageUrl:    posterUrl(item.poster_path, "md"),
    srcSet:      posterSrcSet(item.poster_path),
    placeholder: placeholders.poster,
    rating:      item.vote_average,
    mediaType,
  };
}

export default function MediaCard({ item, type, className = "" }) {
  const [hovered, setHovered]       = useState(false);
  const [trailerKey, setTrailerKey] = useState(null);
  const timerRef                    = useRef(null);

  if (!item) return null;

  const { href, title, subtitle, imageUrl, srcSet, placeholder, rating, mediaType } =
    deriveMedia(item, type);

  const isPerson = mediaType === "person";
  const isMedia  = mediaType === "movie" || mediaType === "tv";

  // Fetch videos lazily once the card is hovered
  const { data: detail } = useTmdb(
    () => {
      if (!hovered || isPerson) return Promise.resolve(null);
      return mediaType === "movie"
        ? getMovie(item.id, "videos")
        : getTv(item.id, "videos");
    },
    [hovered, item.id, mediaType, isPerson]
  );

  const trailer = detail?.videos?.results?.find(
    (v) => v.site === "YouTube" && v.type === "Trailer" && v.official
  ) ?? detail?.videos?.results?.find(
    (v) => v.site === "YouTube" && v.type === "Trailer"
  ) ?? detail?.videos?.results?.find(
    (v) => v.site === "YouTube"
  );

  function handleMouseEnter() {
    timerRef.current = setTimeout(() => setHovered(true), 200);
  }

  function handleMouseLeave() {
    clearTimeout(timerRef.current);
    setHovered(false);
  }

  return (
    <>
      <div
        className={`media-card ${hovered ? "media-card--hovered" : ""} ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Link to={href} className="media-card-link">
          <div className="media-card-poster">
            <img
              src={imageUrl ?? placeholder}
              srcSet={srcSet ?? undefined}
              sizes="(max-width: 480px) 105px, 140px"
              alt={title}
              loading="lazy"
              onError={(e) => { e.target.src = placeholder; }}
              className="media-card-img"
            />

            {/* Dark overlay on hover */}
            <div className="media-card-hover-overlay" />

            {/* Rating badge */}
            {rating != null && rating > 0 && (
              <div className="media-card-rating">
                <RatingBadge value={rating} />
              </div>
            )}

            {/* Watchlist button — top right */}
            {isMedia && (
              <div className="media-card-watchlist">
                <WatchlistButton mediaType={mediaType} mediaId={item.id} size="sm" />
              </div>
            )}

            {/* Trailer button — bottom of poster, visible on hover */}
            {isMedia && trailer && (
              <button
                className="media-card-trailer-btn"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setTrailerKey(trailer.key);
                }}
                aria-label={`Watch trailer for ${title}`}
              >
                <span className="media-card-trailer-icon">▶</span>
                Trailer
              </button>
            )}
          </div>

          <div className="media-card-info">
            <p className="media-card-title">{title}</p>
            {subtitle && <p className="media-card-subtitle">{subtitle}</p>}
          </div>
        </Link>
      </div>

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
