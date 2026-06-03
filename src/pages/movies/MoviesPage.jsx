import BrowsePage from "../browse/BrowsePage";
import { discoverMovies, getMovieGenres } from "../../api/media";

export default function MoviesPage() {
  return (
    <BrowsePage
      mediaType="movie"
      title="Movies"
      fetchFn={discoverMovies}
      genresFn={getMovieGenres}
    />
  );
}
