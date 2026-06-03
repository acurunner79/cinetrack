import { Link } from "react-router-dom";
import { posterUrl, profileUrl, posterSrcSet, placeholders } from "../../utils/tmdbImage";
import RatingBadge from "./RatingBadge";
import WatchlistButton from "./WatchlistButton";

// Derives the correct link path and display fields from the media_type
// field TMDb returns on multi-search / trending results, or from an
// explicit `type` prop when the caller already knows the type.
function deriveMedia(item, type) {
  const mediaType = type || item.media_type;

  if (mediaType === "person") {
    return {
      href: `/people/${item.id}`,
      title: item.name,
      subtitle: item.known_for_department,
      imagePath: item.profile_path,
      imageUrl: profileUrl(item.profile_path, "md"),
      srcSet: null,
      placeholder: placeholders.profile,
      rating: null,
      mediaType: "person",
    };
  }

  const isMovie = mediaType === "movie";
  return {
    href: isMovie ? `/movies/${item.id}` : `/tv/${item.id}`,
    title: isMovie ? item.title : item.name,
    subtitle: isMovie
      ? item.release_date?.slice(0, 4)
      : item.first_air_date?.slice(0, 4),
    imagePath: item.poster_path,
    imageUrl: posterUrl(item.poster_path, "md"),
    srcSet: posterSrcSet(item.poster_path),
    placeholder: placeholders.poster,
    rating: item.vote_average,
    mediaType,
  };
}

export default function MediaCard({ item, type, className = "" }) {
  if (!item) return null;

  const { href, title, subtitle, imageUrl, srcSet, placeholder, rating, mediaType: resolvedType } =
    deriveMedia(item, type);

  return (
    <Link to={href} className={`media-card ${className}`}>
      <div className="media-card-poster">
        <img
          src={imageUrl ?? placeholder}
          srcSet={srcSet ?? undefined}
          sizes="(max-width: 480px) 130px, 185px"
          alt={title}
          loading="lazy"
          onError={(e) => { e.target.src = placeholder; }}
          className="media-card-img"
        />
        {rating != null && (
          <div className="media-card-rating">
            <RatingBadge value={rating} />
          </div>
        )}
        {(resolvedType === "movie" || resolvedType === "tv") && (
          <div className="media-card-watchlist">
            <WatchlistButton mediaType={resolvedType} mediaId={item.id} size="sm" />
          </div>
        )}
      </div>

      <div className="media-card-info">
        <p className="media-card-title">{title}</p>
        {subtitle && <p className="media-card-subtitle">{subtitle}</p>}
      </div>
    </Link>
  );
}
