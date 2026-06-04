import { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTmdb } from "../../hooks/useTmdb";
import {
  getTrending, getNowPlaying, getTopRatedMovies, getAiringToday,
  getMovie, getTv,
} from "../../api/media";
import MediaShelf from "../../components/common/MediaShelf";
import TrailerModal from "../../components/ui/TrailerModal";
import { Skeleton } from "../../components/common/Skeleton";
import { backdropUrl } from "../../utils/tmdbImage";
import WatchlistButton from "../../components/common/WatchlistButton";

const HERO_COUNT    = 6;   // how many trending items cycle through
const AUTO_ADVANCE  = 8000; // ms between auto-advances

function HeroSlide({ item, active, direction }) {
  const navigate = useNavigate();
  const [trailerKey, setTrailerKey] = useState(null);

  const isMovie = item?.media_type !== "tv";

  const { data: detail } = useTmdb(
    () => item
      ? isMovie ? getMovie(item.id, "videos") : getTv(item.id, "videos")
      : Promise.resolve(null),
    [item?.id]
  );

  const trailer = detail?.videos?.results?.find(
    (v) => v.site === "YouTube" && v.type === "Trailer" && v.official
  ) ?? detail?.videos?.results?.find(
    (v) => v.site === "YouTube" && v.type === "Trailer"
  ) ?? detail?.videos?.results?.find((v) => v.site === "YouTube");

  if (!item) return null;

  const title    = item.title ?? item.name;
  const overview = item.overview;
  const year     = (item.release_date ?? item.first_air_date)?.slice(0, 4);
  const bg       = backdropUrl(item.backdrop_path, "xl");
  const href     = item.media_type === "tv" ? `/tv/${item.id}` : `/movies/${item.id}`;
  const mediaType = item.media_type === "tv" ? "tv" : "movie";

  return (
    <>
      <div
        className={`hero-slide ${active ? "hero-slide--active" : ""} hero-slide--${direction}`}
        style={{ "--hero-bg": bg ? `url(${bg})` : "none" }}
      >
        <div className="hero-zoom-layer" />
        <div className="hero-overlay" />

        <div className="hero-content hero-content--animated">
          <p className="hero-label">
            {item.media_type === "tv" ? "TV Series" : "Film"} · {year}
          </p>
          <h1 className="hero-title">{title}</h1>
          {overview && <p className="hero-overview">{overview}</p>}

          <div className="hero-actions">
            <button className="hero-btn hero-btn--primary" onClick={() => navigate(href)}>
              <span>▶</span> View Details
            </button>
            {trailer && (
              <button className="hero-btn hero-btn--trailer" onClick={() => setTrailerKey(trailer.key)}>
                <span>◉</span> Watch Trailer
              </button>
            )}
            <WatchlistButton mediaType={mediaType} mediaId={item.id} size="lg" />
          </div>
        </div>
      </div>

      {trailerKey && (
        <TrailerModal videoKey={trailerKey} title={title} onClose={() => setTrailerKey(null)} />
      )}
    </>
  );
}

function HeroCarousel({ items, loading }) {
  const [index, setIndex]         = useState(0);
  const [direction, setDirection] = useState("next");
  const [paused, setPaused]       = useState(false);

  const slides = items.slice(0, HERO_COUNT);

  const go = useCallback((dir) => {
    setDirection(dir);
    setIndex((i) =>
      dir === "next"
        ? (i + 1) % slides.length
        : (i - 1 + slides.length) % slides.length
    );
  }, [slides.length]);

  // Auto-advance
  useEffect(() => {
    if (paused || slides.length < 2) return;
    const t = setInterval(() => go("next"), AUTO_ADVANCE);
    return () => clearInterval(t);
  }, [paused, go, slides.length]);

  if (loading) {
    return (
      <div className="hero hero--cinematic hero--skeleton">
        <Skeleton width="100%" height="100%" radius={0} />
      </div>
    );
  }

  if (!slides.length) return null;

  return (
    <div
      className="hero hero--cinematic hero-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Render only current slide */}
      <HeroSlide
        key={slides[index]?.id}
        item={slides[index]}
        active
        direction={direction}
      />

      {/* Left arrow */}
      <button
        className="hero-nav-btn hero-nav-btn--left"
        onClick={() => go("prev")}
        aria-label="Previous"
      >
        ‹
      </button>

      {/* Right arrow */}
      <button
        className="hero-nav-btn hero-nav-btn--right"
        onClick={() => go("next")}
        aria-label="Next"
      >
        ›
      </button>

      {/* Dot indicators */}
      <div className="hero-dots">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`hero-dot ${i === index ? "hero-dot--active" : ""}`}
            onClick={() => { setDirection(i > index ? "next" : "prev"); setIndex(i); }}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Progress bar — resets on each slide */}
      {!paused && (
        <div className="hero-progress" key={`${index}-${paused}`}>
          <div className="hero-progress-bar" style={{ "--duration": `${AUTO_ADVANCE}ms` }} />
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const { account } = useAuth();

  const trending    = useTmdb(() => getTrending("all", "day"), []);
  const nowPlaying  = useTmdb(() => getNowPlaying(),           []);
  const topRated    = useTmdb(() => getTopRatedMovies(),       []);
  const airingToday = useTmdb(() => getAiringToday(),          []);

  const heroItems = useMemo(() => {
    return (trending.data?.results ?? [])
      .filter((r) => r.backdrop_path && r.overview)
      .slice(0, HERO_COUNT);
  }, [trending.data]);

  const greeting = account?.name || account?.username
    ? `Welcome back, ${account.name || account.username}`
    : "What are you watching tonight?";

  return (
    <div className="home">
      <HeroCarousel items={heroItems} loading={trending.loading} />

      <div className="home-content">
        <h2 className="home-greeting">{greeting}</h2>

        <MediaShelf
          title="Trending today"
          items={trending.data?.results}
          loading={trending.loading}
          error={trending.error}
        />
        <MediaShelf
          title="Now in cinemas"
          items={nowPlaying.data?.results}
          loading={nowPlaying.loading}
          error={nowPlaying.error}
          type="movie"
        />
        <MediaShelf
          title="Top rated movies"
          items={topRated.data?.results}
          loading={topRated.loading}
          error={topRated.error}
          type="movie"
        />
        <MediaShelf
          title="Airing on TV today"
          items={airingToday.data?.results}
          loading={airingToday.loading}
          error={airingToday.error}
          type="tv"
        />
      </div>
    </div>
  );
}
