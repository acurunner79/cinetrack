import { useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTmdb } from "../../hooks/useTmdb";
import {
  getTrending,
  getNowPlaying,
  getTopRatedMovies,
  getAiringToday,
} from "../../api/media";
import MediaShelf from "../../components/common/MediaShelf";
import { backdropUrl } from "../../utils/tmdbImage";

function HeroBanner({ item }) {
  if (!item) return null;

  const title = item.title ?? item.name;
  const overview = item.overview;
  const year = (item.release_date ?? item.first_air_date)?.slice(0, 4);
  const bg = backdropUrl(item.backdrop_path, "lg");

  return (
    <div
      className="hero"
      style={{ "--hero-bg": bg ? `url(${bg})` : "none" }}
    >
      <div className="hero-overlay" />
      <div className="hero-content">
        <p className="hero-label">
          {item.media_type === "tv" ? "TV Series" : "Film"} · {year}
        </p>
        <h1 className="hero-title">{title}</h1>
        {overview && <p className="hero-overview">{overview}</p>}
      </div>
    </div>
  );
}

export default function HomePage() {
  const { account } = useAuth();

  const trending    = useTmdb(() => getTrending("all", "day"),   []);
  const nowPlaying  = useTmdb(() => getNowPlaying(),             []);
  const topRated    = useTmdb(() => getTopRatedMovies(),         []);
  const airingToday = useTmdb(() => getAiringToday(),            []);

  // Pick the highest-rated backdrop from trending for the hero
  const heroItem = useMemo(() => {
    const results = trending.data?.results ?? [];
    return results.find((r) => r.backdrop_path) ?? results[0] ?? null;
  }, [trending.data]);

  const greeting = account?.name || account?.username
    ? `Welcome back, ${account.name || account.username}`
    : "What are you watching tonight?";

  return (
    <div className="home">
      <HeroBanner item={heroItem} />

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
