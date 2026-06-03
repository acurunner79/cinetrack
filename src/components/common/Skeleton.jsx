// Skeleton — animated shimmer placeholder for loading states
// Usage:
//   <Skeleton width="100%" height={210} radius={8} />
//   <Skeleton variant="text" lines={3} />
//   <Skeleton variant="card" />       — poster card shape
//   <Skeleton variant="detail" />     — hero detail shape

export function Skeleton({ width, height, radius = 6, className = "" }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width:        width  ?? "100%",
        height:       height ?? 16,
        borderRadius: radius,
      }}
      aria-hidden="true"
    />
  );
}

// Multiple lines of text skeleton
export function SkeletonText({ lines = 3, className = "" }) {
  return (
    <div className={`skeleton-text ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{
            height:       14,
            borderRadius: 4,
            width:        i === lines - 1 ? "60%" : "100%",
          }}
        />
      ))}
    </div>
  );
}

// Poster card skeleton — matches MediaCard dimensions
export function SkeletonCard() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="skeleton" style={{ width: "100%", paddingTop: "150%", borderRadius: 8 }} />
      <div style={{ padding: "6px 2px 0", display: "flex", flexDirection: "column", gap: 5 }}>
        <div className="skeleton" style={{ height: 13, borderRadius: 4, width: "85%" }} />
        <div className="skeleton" style={{ height: 11, borderRadius: 4, width: "40%" }} />
      </div>
    </div>
  );
}

// Row of skeleton cards for shelves / grids
export function SkeletonGrid({ count = 10, className = "" }) {
  return (
    <div className={`skeleton-grid ${className}`} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

// Horizontal shelf of skeleton cards
export function SkeletonShelf({ count = 8 }) {
  return (
    <div className="skeleton-shelf" aria-hidden="true">
      <div className="skeleton" style={{ height: 20, width: 160, borderRadius: 4, marginBottom: 16 }} />
      <div className="shelf-track">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} style={{ flexShrink: 0, width: 140 }}>
            <div className="skeleton" style={{ width: 140, height: 210, borderRadius: 8 }} />
            <div style={{ padding: "6px 2px 0", display: "flex", flexDirection: "column", gap: 5 }}>
              <div className="skeleton" style={{ height: 13, borderRadius: 4, width: "85%" }} />
              <div className="skeleton" style={{ height: 11, borderRadius: 4, width: "40%" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Detail page hero skeleton
export function SkeletonDetail() {
  return (
    <div className="skeleton-detail" aria-hidden="true">
      {/* Backdrop */}
      <div className="skeleton" style={{ width: "100%", height: 460, borderRadius: 0 }} />
      {/* Body */}
      <div style={{ padding: "2.5rem 0", display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="skeleton" style={{ height: 18, width: 180, borderRadius: 4 }} />
        <div className="skeleton" style={{ height: 36, width: "55%", borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 14, width: "30%", borderRadius: 4 }} />
        <SkeletonText lines={3} />
      </div>
    </div>
  );
}
