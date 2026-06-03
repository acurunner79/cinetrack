import { useParams, Link } from "react-router-dom";
import { useTmdb } from "../../hooks/useTmdb";
import { getTv } from "../../api/media";
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
import SeasonAccordion from "../../components/media/SeasonAccordion";
import MediaShelf from "../../components/common/MediaShelf";

const APPEND = "credits,videos,watch_providers,recommendations,similar";

function statusBadge(status) {
  if (!status) return null;
  const cls =
    status === "Returning Series" ? "status-badge status-badge--returning"
    : status === "Ended"          ? "status-badge status-badge--ended"
    : status === "Canceled"       ? "status-badge status-badge--canceled"
    : "status-badge";
  return <span className={cls}>{status}</span>;
}

export default function TvDetailPage() {
  const { id } = useParams();

  const { data: show, loading, error } = useTmdb(
    () => getTv(id, APPEND),
    [id]
  );

  if (loading) {
    return (
      <div className="detail-loading">
        <Spinner size="lg" label="Loading show…" />
      </div>
    );
  }

  if (error || !show) {
    return (
      <div className="detail-error">
        <p>Could not load this show.</p>
        <Link to="/" className="detail-back">← Back home</Link>
      </div>
    );
  }

  const cast            = show.credits?.cast ?? [];
  const videos          = show.videos?.results ?? [];
  const watchProviders  = show["watch/providers"];
  const recommendations = show.recommendations?.results ?? [];
  const similar         = show.similar?.results ?? [];
  const genres          = show.genres ?? [];
  const seasons         = show.seasons ?? [];
  const networks        = show.networks ?? [];
  const year            = show.first_air_date?.slice(0, 4);
  const lastYear        = show.last_air_date?.slice(0, 4);
  const yearRange       = year === lastYear || !lastYear ? year : `${year}–${lastYear}`;

  return (
    <div className="detail">
      {/* ── Hero backdrop ───────────────────────────────────────── */}
      <div
        className="detail-hero"
        style={{
          "--detail-backdrop": show.backdrop_path
            ? `url(${backdropUrl(show.backdrop_path, "lg")})`
            : "none",
        }}
      >
        <div className="detail-hero-overlay" />
        <div className="detail-hero-content">
          <img
            src={posterUrl(show.poster_path, "md")}
            srcSet={posterSrcSet(show.poster_path)}
            sizes="185px"
            alt={show.name}
            className="detail-poster"
            onError={(e) => { e.target.src = placeholders.poster; }}
          />

          <div className="detail-meta">
            <div className="detail-genres">
              {genres.map((g) => (
                <span key={g.id} className="genre-pill">{g.name}</span>
              ))}
            </div>

            <h1 className="detail-title">{show.name}</h1>

            {show.tagline && (
              <p className="detail-tagline">"{show.tagline}"</p>
            )}

            <div className="detail-facts">
              {yearRange && <span>{yearRange}</span>}
              {seasons.filter(s => s.season_number > 0).length > 0 && (
                <span>{seasons.filter(s => s.season_number > 0).length} season{seasons.filter(s => s.season_number > 0).length !== 1 ? "s" : ""}</span>
              )}
              {show.vote_average > 0 && (
                <RatingBadge value={show.vote_average} />
              )}
              {statusBadge(show.status)}
            </div>

            {/* Networks */}
            {networks.length > 0 && (
              <div className="detail-networks">
                {networks.map((n) => (
                  <span key={n.id} className="detail-network">{n.name}</span>
                ))}
              </div>
            )}

            <p className="detail-overview">{show.overview}</p>

            <div className="detail-actions">
              <TrailerButton videos={videos} />
              <WatchlistButton mediaType="tv" mediaId={show.id} size="lg" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────── */}
      <div className="detail-body">
        <CastScroller cast={cast} />

        <SeasonAccordion tvId={show.id} seasons={seasons} />

        <ProviderGrid watchProviders={watchProviders} />

        {recommendations.length > 0 && (
          <MediaShelf
            title="More like this"
            items={recommendations}
            type="tv"
          />
        )}

        {recommendations.length === 0 && similar.length > 0 && (
          <MediaShelf
            title="Similar shows"
            items={similar}
            type="tv"
          />
        )}
      </div>
    </div>
  );
}
