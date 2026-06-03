export default function RatingBadge({ value }) {
  if (!value || value === 0) return null;

  const score = Math.round(value * 10) / 10;

  // Color encodes quality tier
  const cls =
    score >= 7.5 ? "rating-badge rating-badge--good"
    : score >= 6  ? "rating-badge rating-badge--ok"
    : "rating-badge rating-badge--poor";

  return <span className={cls}>{score}</span>;
}
