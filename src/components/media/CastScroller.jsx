import { Link } from "react-router-dom";
import { profileUrl, placeholders } from "../../utils/tmdbImage";

export default function CastScroller({ cast = [] }) {
  if (!cast.length) return null;

  // Limit to top-billed cast
  const visible = cast.slice(0, 20);

  return (
    <section className="cast-scroller">
      <h3 className="section-heading">Cast</h3>
      <div className="cast-track">
        {visible.map((person) => (
          <Link
            key={person.id}
            to={`/people/${person.id}`}
            className="cast-card"
          >
            <div className="cast-card-img-wrap">
              <img
                src={profileUrl(person.profile_path, "sm") ?? placeholders.profile}
                alt={person.name}
                loading="lazy"
                onError={(e) => { e.target.src = placeholders.profile; }}
                className="cast-card-img"
              />
            </div>
            <p className="cast-card-name">{person.name}</p>
            <p className="cast-card-role">{person.character}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
