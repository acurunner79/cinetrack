import BrowsePage from "../browse/BrowsePage";
import { discoverTv, getTvGenres } from "../../api/media";

export default function TvPage() {
  return (
    <BrowsePage
      mediaType="tv"
      title="TV Shows"
      fetchFn={discoverTv}
      genresFn={getTvGenres}
    />
  );
}
