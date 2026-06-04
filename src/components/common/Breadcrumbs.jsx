import { Link, useLocation } from "react-router-dom";
import { useHistory } from "../../context/HistoryContext";

const ROUTE_LABELS = {
  "/":          "Home",
  "/movies":    "Movies",
  "/tv":        "TV Shows",
  "/search":    "Search",
  "/watchlist": "Watchlist",
  "/people":    "People",
};

function buildCrumbs(pathname, history) {
  const crumbs = [{ label: "Home", href: "/" }];
  const segments = pathname.split("/").filter(Boolean);
  if (!segments.length) return crumbs;

  let built = "";
  for (let i = 0; i < segments.length; i++) {
    built += `/${segments[i]}`;
    const isLast = i === segments.length - 1;
    const isId   = /^\d+$/.test(segments[i]);

    if (isId) {
      const mediaType =
        segments[i - 1] === "movies" ? "movie"
        : segments[i - 1] === "tv"   ? "tv"
        : segments[i - 1] === "people" ? "person"
        : null;

      const entry = mediaType
        ? history.find((h) => h.id === Number(segments[i]) && h.mediaType === mediaType)
        : null;

      crumbs.push({
        label: entry?.title ?? "...",
        href:  isLast ? null : built,
      });
    } else {
      const label = ROUTE_LABELS[built] ?? capitalize(segments[i]);
      crumbs.push({ label, href: isLast ? null : built });
    }
  }

  return crumbs;
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function Breadcrumbs() {
  const location = useLocation();
  const { history } = useHistory();
  const crumbs = buildCrumbs(location.pathname, history);

  // Only show when there are at least 2 crumbs beyond Home
  // i.e. we're on a detail page like /movies/123
  if (crumbs.length < 3) return null;

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol className="breadcrumbs-list">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <li key={i} className="breadcrumbs-item">
              {isLast || !crumb.href ? (
                <span className="breadcrumbs-current" aria-current={isLast ? "page" : undefined}>
                  {crumb.label}
                </span>
              ) : (
                <Link to={crumb.href} className="breadcrumbs-link">
                  {crumb.label}
                </Link>
              )}
              {!isLast && (
                <span className="breadcrumbs-sep" aria-hidden="true">›</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
