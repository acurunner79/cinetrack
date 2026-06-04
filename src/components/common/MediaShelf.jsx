import { useRef, useState, useCallback } from "react";
import MediaCard from "./MediaCard";
import { SkeletonShelf } from "./Skeleton";

export default function MediaShelf({ title, items, loading, error, type }) {
  const trackRef   = useRef(null);
  const [canLeft,  setCanLeft]  = useState(false);
  const [canRight, setCanRight] = useState(true);

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 10);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  function scroll(dir) {
    const el = trackRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({ left: dir === "right" ? amount : -amount, behavior: "smooth" });
    setTimeout(updateArrows, 350);
  }

  if (loading) return <SkeletonShelf count={8} />;

  return (
    <section className="shelf">
      <h2 className="shelf-title">{title}</h2>

      {error && <div className="shelf-state shelf-state--error">Failed to load — {error}</div>}
      {!error && items?.length === 0 && <div className="shelf-state">Nothing here yet.</div>}

      {!error && items?.length > 0 && (
        <div className="shelf-scroll-wrap">
          {/* Left arrow */}
          {canLeft && (
            <button
              className="shelf-arrow shelf-arrow--left"
              onClick={() => scroll("left")}
              aria-label="Scroll left"
            >
              ‹
            </button>
          )}

          <div
            className="shelf-track"
            ref={trackRef}
            onScroll={updateArrows}
          >
            {items.map((item) => (
              <MediaCard
                key={`${item.media_type ?? type}-${item.id}`}
                item={item}
                type={type}
              />
            ))}
          </div>

          {/* Right arrow */}
          {canRight && (
            <button
              className="shelf-arrow shelf-arrow--right"
              onClick={() => scroll("right")}
              aria-label="Scroll right"
            >
              ›
            </button>
          )}
        </div>
      )}
    </section>
  );
}
