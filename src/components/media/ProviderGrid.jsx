import { logoUrl, placeholders } from "../../utils/tmdbImage";

function ProviderRow({ label, providers = [] }) {
  if (!providers.length) return null;
  return (
    <div className="provider-row">
      <span className="provider-row-label">{label}</span>
      <div className="provider-logos">
        {providers.map((p) => (
          <img
            key={p.provider_id}
            src={logoUrl(p.logo_path, "sm") ?? placeholders.poster}
            alt={p.provider_name}
            title={p.provider_name}
            className="provider-logo"
            loading="lazy"
            onError={(e) => { e.target.style.display = "none"; }}
          />
        ))}
      </div>
    </div>
  );
}

export default function ProviderGrid({ watchProviders }) {
  // watchProviders is the full watch/providers results object
  // TMDb returns country-keyed data; default to US
  const region = watchProviders?.results?.US ?? {};

  const hasAny =
    region.flatrate?.length ||
    region.rent?.length ||
    region.buy?.length;

  if (!hasAny) return null;

  return (
    <section className="provider-grid">
      <h3 className="section-heading">Where to watch</h3>
      {region.link && (
        <a
          href={region.link}
          target="_blank"
          rel="noopener noreferrer"
          className="provider-tmdb-link"
        >
          View all on TMDb
        </a>
      )}
      <div className="provider-rows">
        <ProviderRow label="Stream" providers={region.flatrate} />
        <ProviderRow label="Rent"   providers={region.rent} />
        <ProviderRow label="Buy"    providers={region.buy} />
      </div>
    </section>
  );
}
