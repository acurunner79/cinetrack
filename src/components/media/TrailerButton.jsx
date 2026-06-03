export default function TrailerButton({ videos = [] }) {
  // Prefer official trailers, fall back to any YouTube video
  const trailer =
    videos.find(
      (v) => v.site === "YouTube" && v.type === "Trailer" && v.official
    ) ??
    videos.find((v) => v.site === "YouTube" && v.type === "Trailer") ??
    videos.find((v) => v.site === "YouTube");

  if (!trailer) return null;

  return (
    <a
      href={`https://www.youtube.com/watch?v=${trailer.key}`}
      target="_blank"
      rel="noopener noreferrer"
      className="trailer-button"
    >
      <span className="trailer-button-icon">▶</span>
      Watch trailer
    </a>
  );
}
