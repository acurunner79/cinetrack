export default function Spinner({ size = "md", label = "Loading…" }) {
  const px = size === "sm" ? 20 : size === "lg" ? 48 : 32;

  return (
    <div className="spinner-wrap" role="status" aria-label={label}>
      <svg
        className="spinner"
        width={px}
        height={px}
        viewBox="0 0 24 24"
        fill="none"
        style={{ "--spinner-size": `${px}px` }}
      >
        <circle
          cx="12" cy="12" r="10"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeOpacity="0.2"
        />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );
}
