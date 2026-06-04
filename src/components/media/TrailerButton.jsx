import { useState } from "react";
import TrailerModal from "../ui/TrailerModal";

export default function TrailerButton({ videos = [], title = "Trailer" }) {
  const [open, setOpen] = useState(false);

  const trailer =
    videos.find((v) => v.site === "YouTube" && v.type === "Trailer" && v.official) ??
    videos.find((v) => v.site === "YouTube" && v.type === "Trailer") ??
    videos.find((v) => v.site === "YouTube");

  if (!trailer) return null;

  return (
    <>
      <button className="trailer-button" onClick={() => setOpen(true)}>
        <span className="trailer-button-icon">▶</span>
        Watch trailer
      </button>

      {open && (
        <TrailerModal
          videoKey={trailer.key}
          title={title}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
