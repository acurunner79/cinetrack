import { useParams, Link } from "react-router-dom";
import { useTmdb } from "../../hooks/useTmdb";
import { getMovie } from "../../api/media";
import {
  backdropUrl,
  posterUrl,
  posterSrcSet,
  placeholders,
} from "../../utils/tmdbImage";
import Spinner from "../../components/common/Spinner";
import RatingBadge from "../../components/common/RatingBadge";
import WatchlistButton from "../../components/common/WatchlistButton";
import CastScroller from "../../components/media/CastScroller";
import TrailerButton from "../../components/media/TrailerButton";
import ProviderGrid from "../../components/media/ProviderGrid";
import MediaShelf from "../../components/common/MediaShelf";

const APPEND = "credits,videos,watch_providers,recommendations,similar";

function runtime(mins) {
  if (!mins) return null;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

export default function MovieDetailPage() {
  const { id } = useParams();

  const { data: movie, loading, error } = useTmdb(
    () => getMovie(id, APPEND),
    [id]
  );

  if (loading) {
    return (
      <div className="detail-loading">
        <Spinner size="lg" label="Loading movie…" />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="detail-error">
        <p>Could not load this movie.</p>
        <Link to="/" className="detail-back">← Back home</Link>
      </div>
    );
  }

  const cast          = movie.credits?.cast ?? [];
  const videos        = movie.videos?.results ?? [];
  const watchProviders = movie["watch/providers"];
  const recommendations = movie.recommendations?.results ?? [];
  const similar       = movie.similar?.results ?? [];
  const genres        = movie.genres ?? [];
  const year          = movie.release_date?.slice(0, 4);
  const rt            = runtime(movie.runtime);

  return (
    <div className="detail">
      {/* ── Hero backdrop ───────────────────────────────────────── */}
      <div
        className="detail-hero"
        style={{
          "--detail-backdrop": movie.backdrop_path
            ? `url(${backdropUrl(movie.backdrop_path, "lg")})`
            : "none",
        }}
      >
        <div className="detail-hero-overlay" />
        <div className="detail-hero-content">
          <img
            src={posterUrl(movie.poster_path, "md")}
            srcSet={posterSrcSet(movie.poster_path)}
            sizes="185px"
            alt={movie.title}
            className="detail-poster"
            onError={(e) => { e.target.src = placeholders.poster; }}
          />
          <div className="detail-meta">
            <div className="detail-genres">
              {genres.map((g) => (
                <span key={g.id} className="genre-pill">{g.name}</span>
              ))}
            </div>
            <h1 className="detail-title">{movie.title}</h1>
            {movie.tagline && (
              <p className="detail-tagline">"{movie.tagline}"</p>
            )}
            <div className="detail-facts">
              {year && <span>{year}</span>}
              {rt   && <span>{rt}</span>}
              {movie.vote_average > 0 && (
                <RatingBadge value={movie.vote_average} />
              )}
              {movie.vote_count > 0 && (
                <span className="detail-votes">
                  {movie.vote_count.toLocaleString()} votes
                </span>
              )}
            </div>
            <p className="detail-overview">{movie.overview}</p>
            <div className="detail-actions">
              <TrailerButton videos={videos} />
              <WatchlistButton mediaType="movie" mediaId={movie.id} size="lg" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────── */}
      <div className="detail-body">
        <CastScroller cast={cast} />
        <ProviderGrid watchProviders={watchProviders} />

        {recommendations.length > 0 && (
          <MediaShelf
            title="More like this"
            items={recommendations}
            type="movie"
          />
        )}

        {recommendations.length === 0 && similar.length > 0 && (
          <MediaShelf
            title="Similar movies"
            items={similar}
            type="movie"
          />
        )}
      </div>
    </div>
  );
}
