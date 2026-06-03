import MediaCard from "./MediaCard";
import { SkeletonShelf } from "./Skeleton";

export default function MediaShelf({ title, items, loading, error, type }) {
  if (loading) return <SkeletonShelf count={8} />;

  return (
    <section className="shelf">
      <h2 className="shelf-title">{title}</h2>

      {error && (
        <div className="shelf-state shelf-state--error">
          Failed to load — {error}
        </div>
      )}

      {!error && items?.length === 0 && (
        <div className="shelf-state">Nothing here yet.</div>
      )}

      {!error && items?.length > 0 && (
        <div className="shelf-track">
          {items.map((item) => (
            <MediaCard
              key={`${item.media_type ?? type}-${item.id}`}
              item={item}
              type={type}
            />
          ))}
        </div>
      )}
    </section>
  );
}
