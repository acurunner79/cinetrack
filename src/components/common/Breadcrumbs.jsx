import { Link, useLocation, useMatches } from "react-router-dom";
import { useHistory } from "../../context/HistoryContext";

// Static label map for known routes
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

  // Build up path segment by segment
  let built = "";
  for (let i = 0; i < segments.length; i++) {
    built += `/${segments[i]}`;
    const isLast    = i === segments.length - 1;
    const isId      = /^\d+$/.test(segments[i]);
    const parentPath = segments.slice(0, i).join("/");

    if (isId) {
      // Look up the name from recently viewed history
      const mediaType =
        segments[i - 1] === "movies" ? "movie"
        : segments[i - 1] === "tv"   ? "tv"
        : segments[i - 1] === "people" ? "person"
        : null;

      const historyEntry = mediaType
        ? history.find((h) => h.id === Number(segments[i]) && h.mediaType === mediaType)
        : null;

      crumbs.push({
        label: historyEntry?.title ?? "Detail",
        href:  isLast ? null : built,
      });
    } else {
      const label = ROUTE_LABELS[built] ?? capitalize(segments[i]);
      crumbs.push({ label, href: isLast ? null : built });
    }
  }

  return crumbs;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function Breadcrumbs() {
  const location = useLocation();
  const { history } = useHistory();

  const crumbs = buildCrumbs(location.pathname, history);

  // Don't show breadcrumbs on home or top-level pages
  if (crumbs.length <= 1) return null;
  const isTopLevel = crumbs.length === 2 && !crumbs[1].href;
  if (isTopLevel) return null;

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol className="breadcrumbs-list">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <li key={i} className="breadcrumbs-item">
              {isLast || !crumb.href ? (
                <span className="breadcrumbs-current" aria-current="page">
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
