import { useState } from "react";
import { useTmdb } from "../../hooks/useTmdb";
import { getSeason } from "../../api/media";
import { stillUrl, posterUrl, placeholders } from "../../utils/tmdbImage";
import Spinner from "../common/Spinner";

function EpisodeRow({ episode }) {
  const stillSrc = stillUrl(episode.still_path, "md") ?? placeholders.backdrop;
  const airDate  = episode.air_date?.slice(0, 10);
  const runtime  = episode.runtime ? `${episode.runtime}m` : null;

  return (
    <div className="episode-row">
      <div className="episode-still-wrap">
        <img
          src={stillSrc}
          alt={episode.name}
          className="episode-still"
          loading="lazy"
          onError={(e) => { e.target.src = placeholders.backdrop; }}
        />
        <span className="episode-num">E{episode.episode_number}</span>
      </div>
      <div className="episode-info">
        <p className="episode-name">{episode.name}</p>
        <div className="episode-meta">
          {airDate  && <span>{airDate}</span>}
          {runtime  && <span>{runtime}</span>}
          {episode.vote_average > 0 && (
            <span className="episode-rating">{Math.round(episode.vote_average * 10) / 10}</span>
          )}
        </div>
        {episode.overview && (
          <p className="episode-overview">{episode.overview}</p>
        )}
      </div>
    </div>
  );
}

function SeasonPanel({ tvId, season }) {
  const { data, loading, error } = useTmdb(
    () => getSeason(tvId, season.season_number),
    [tvId, season.season_number]
  );

  if (loading) return <div className="season-panel-state"><Spinner size="sm" /></div>;
  if (error)   return <div className="season-panel-state season-panel-state--error">Failed to load episodes</div>;

  const episodes = data?.episodes ?? [];

  return (
    <div className="season-panel">
      {episodes.map((ep) => (
        <EpisodeRow key={ep.id} episode={ep} />
      ))}
    </div>
  );
}

export default function SeasonAccordion({ tvId, seasons = [] }) {
  const [openSeason, setOpenSeason] = useState(null);

  // Filter out specials (season 0) unless that's all there is
  const filtered = seasons.filter((s) => s.season_number > 0) || seasons;

  if (!filtered.length) return null;

  function toggle(seasonNumber) {
    setOpenSeason((prev) => (prev === seasonNumber ? null : seasonNumber));
  }

  return (
    <section className="season-accordion">
      <h3 className="section-heading">Seasons</h3>
      {filtered.map((season) => {
        const isOpen  = openSeason === season.season_number;
        const poster  = posterUrl(season.poster_path, "sm") ?? placeholders.poster;
        const airYear = season.air_date?.slice(0, 4);

        return (
          <div key={season.id} className={`season-item ${isOpen ? "season-item--open" : ""}`}>
            <button
              className="season-header"
              onClick={() => toggle(season.season_number)}
              aria-expanded={isOpen}
            >
              <img
                src={poster}
                alt={season.name}
                className="season-poster"
                onError={(e) => { e.target.src = placeholders.poster; }}
              />
              <div className="season-header-info">
                <span className="season-name">{season.name}</span>
                <span className="season-meta">
                  {season.episode_count} episode{season.episode_count !== 1 ? "s" : ""}
                  {airYear && ` · ${airYear}`}
                </span>
              </div>
              <span className={`season-chevron ${isOpen ? "season-chevron--open" : ""}`}>
                ▾
              </span>
            </button>

            {isOpen && (
              <SeasonPanel tvId={tvId} season={season} />
            )}
          </div>
        );
      })}
    </section>
  );
}
