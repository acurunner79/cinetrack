import MediaCard from "./MediaCard";
import Spinner from "./Spinner";

export default function MediaShelf({ title, items, loading, error, type }) {
  return (
    <section className="shelf">
      <h2 className="shelf-title">{title}</h2>

      {loading && (
        <div className="shelf-state">
          <Spinner />
        </div>
      )}

      {error && (
        <div className="shelf-state shelf-state--error">
          Failed to load — {error}
        </div>
      )}

      {!loading && !error && items?.length === 0 && (
        <div className="shelf-state">Nothing here yet.</div>
      )}

      {!loading && !error && items?.length > 0 && (
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
