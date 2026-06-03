import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTmdb } from "../../hooks/useTmdb";
import { getPerson } from "../../api/media";
import {
  profileUrl,
  posterUrl,
  posterSrcSet,
  placeholders,
} from "../../utils/tmdbImage";
import Spinner from "../../components/common/Spinner";
import RatingBadge from "../../components/common/RatingBadge";

const APPEND = "combined_credits,images,external_ids";

// -------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------

function getAge(birthday, deathday) {
  if (!birthday) return null;
  const end  = deathday ? new Date(deathday) : new Date();
  const born = new Date(birthday);
  let age    = end.getFullYear() - born.getFullYear();
  const m    = end.getMonth() - born.getMonth();
  if (m < 0 || (m === 0 && end.getDate() < born.getDate())) age--;
  return age;
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
}

// Sort credits by date descending, dedup by id
function sortedCredits(credits = []) {
  const seen = new Set();
  return credits
    .filter((c) => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    })
    .sort((a, b) => {
      const dateA = a.release_date || a.first_air_date || "";
      const dateB = b.release_date || b.first_air_date || "";
      return dateB.localeCompare(dateA);
    });
}

// -------------------------------------------------------------------
// Sub-components
// -------------------------------------------------------------------

function CreditCard({ credit }) {
  const isMovie = credit.media_type === "movie";
  const title   = isMovie ? credit.title : credit.name;
  const year    = (isMovie ? credit.release_date : credit.first_air_date)?.slice(0, 4);
  const href    = isMovie ? `/movies/${credit.id}` : `/tv/${credit.id}`;
  const role    = credit.character || credit.job || null;

  return (
    <Link to={href} className="credit-card">
      <div className="credit-card-poster-wrap">
        <img
          src={posterUrl(credit.poster_path, "sm") ?? placeholders.poster}
          srcSet={posterSrcSet(credit.poster_path)}
          sizes="92px"
          alt={title}
          loading="lazy"
          onError={(e) => { e.target.src = placeholders.poster; }}
          className="credit-card-poster"
        />
        {credit.vote_average > 0 && (
          <div className="credit-card-rating">
            <RatingBadge value={credit.vote_average} />
          </div>
        )}
      </div>
      <div className="credit-card-info">
        <p className="credit-card-title">{title}</p>
        {year && <p className="credit-card-year">{year}</p>}
        {role && <p className="credit-card-role">{role}</p>}
      </div>
    </Link>
  );
}

function Filmography({ credits }) {
  const [tab, setTab] = useState("acting");

  const castCredits = sortedCredits(
    credits?.cast?.filter((c) => c.poster_path || c.backdrop_path) ?? []
  );
  const crewCredits = sortedCredits(
    credits?.crew?.filter((c) => c.poster_path || c.backdrop_path) ?? []
  );

  const items = tab === "acting" ? castCredits : crewCredits;

  if (!castCredits.length && !crewCredits.length) return null;

  return (
    <section className="filmography">
      <div className="filmography-header">
        <h3 className="section-heading" style={{ marginBottom: 0 }}>Filmography</h3>
        <div className="filmography-tabs">
          {castCredits.length > 0 && (
            <button
              className={`filmography-tab ${tab === "acting" ? "filmography-tab--active" : ""}`}
              onClick={() => setTab("acting")}
            >
              Acting
              <span className="filmography-tab-count">{castCredits.length}</span>
            </button>
          )}
          {crewCredits.length > 0 && (
            <button
              className={`filmography-tab ${tab === "crew" ? "filmography-tab--active" : ""}`}
              onClick={() => setTab("crew")}
            >
              Crew
              <span className="filmography-tab-count">{crewCredits.length}</span>
            </button>
          )}
        </div>
      </div>

      <div className="filmography-grid">
        {items.map((credit) => (
          <CreditCard key={`${credit.media_type}-${credit.id}-${credit.credit_id}`} credit={credit} />
        ))}
      </div>
    </section>
  );
}

// -------------------------------------------------------------------
// Main page
// -------------------------------------------------------------------

export default function PersonPage() {
  const { id } = useParams();

  // All hooks must be called before any early returns
  const [bioExpanded, setBioExpanded] = useState(false);

  const { data: person, loading, error } = useTmdb(
    () => getPerson(id, APPEND),
    [id]
  );

  if (loading) {
    return (
      <div className="detail-loading">
        <Spinner size="lg" label="Loading person…" />
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="detail-error">
        <p>Could not load this person.</p>
        <Link to="/" className="detail-back">← Back home</Link>
      </div>
    );
  }

  const age         = getAge(person.birthday, person.deathday);
  const birthday    = formatDate(person.birthday);
  const deathday    = formatDate(person.deathday);
  const knownFor    = sortedCredits(person.combined_credits?.cast ?? []).slice(0, 10);

  const bioFull    = person.biography ?? "";
  const bioShort   = bioFull.length > 600 ? bioFull.slice(0, 600).trimEnd() + "…" : bioFull;
  const showToggle = bioFull.length > 600;

  return (
    <div className="person-page">
      <div className="person-hero">
        {/* Profile photo */}
        <div className="person-photo-wrap">
          <img
            src={profileUrl(person.profile_path, "lg") ?? placeholders.profile}
            alt={person.name}
            className="person-photo"
            onError={(e) => { e.target.src = placeholders.profile; }}
          />
        </div>

        {/* Info column */}
        <div className="person-info">
          <h1 className="person-name">{person.name}</h1>

          {person.known_for_department && (
            <p className="person-department">{person.known_for_department}</p>
          )}

          <dl className="person-facts">
            {birthday && (
              <>
                <dt>Born</dt>
                <dd>{birthday}{age && !person.deathday ? ` (age ${age})` : ""}</dd>
              </>
            )}
            {deathday && (
              <>
                <dt>Died</dt>
                <dd>{deathday}{age ? ` (age ${age})` : ""}</dd>
              </>
            )}
            {person.place_of_birth && (
              <>
                <dt>From</dt>
                <dd>{person.place_of_birth}</dd>
              </>
            )}
          </dl>

          {/* External links */}
          <div className="person-links">
            {person.external_ids?.imdb_id && (
              <a
                href={`https://www.imdb.com/name/${person.external_ids.imdb_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="person-ext-link"
              >
                IMDb
              </a>
            )}
            {person.external_ids?.instagram_id && (
              <a
                href={`https://instagram.com/${person.external_ids.instagram_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="person-ext-link"
              >
                Instagram
              </a>
            )}
            {person.homepage && (
              <a
                href={person.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="person-ext-link"
              >
                Website
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Biography */}
      {bioFull && (
        <section className="person-bio">
          <h3 className="section-heading">Biography</h3>
          <p className="person-bio-text">
            {bioExpanded ? bioFull : bioShort}
          </p>
          {showToggle && (
            <button
              className="person-bio-toggle"
              onClick={() => setBioExpanded((v) => !v)}
            >
              {bioExpanded ? "Show less" : "Read more"}
            </button>
          )}
        </section>
      )}

      {/* Known for shelf */}
      {knownFor.length > 0 && (
        <section className="person-known-for">
          <h3 className="section-heading">Known for</h3>
          <div className="shelf-track">
            {knownFor.map((credit) => (
              <Link
                key={`${credit.media_type}-${credit.id}`}
                to={credit.media_type === "movie" ? `/movies/${credit.id}` : `/tv/${credit.id}`}
                className="media-card"
              >
                <div className="media-card-poster">
                  <img
                    src={posterUrl(credit.poster_path, "md") ?? placeholders.poster}
                    alt={credit.title || credit.name}
                    loading="lazy"
                    onError={(e) => { e.target.src = placeholders.poster; }}
                    className="media-card-img"
                  />
                  {credit.vote_average > 0 && (
                    <div className="media-card-rating">
                      <RatingBadge value={credit.vote_average} />
                    </div>
                  )}
                </div>
                <div className="media-card-info">
                  <p className="media-card-title">{credit.title || credit.name}</p>
                  <p className="media-card-subtitle">
                    {(credit.release_date || credit.first_air_date)?.slice(0, 4)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Full filmography */}
      <Filmography credits={person.combined_credits} />
    </div>
  );
}
