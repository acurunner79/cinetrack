import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/common/ThemeToggle";
import SearchBar from "../components/nav/SearchBar";
import Breadcrumbs from "../components/common/Breadcrumbs";
import Breadcrumbs from "../components/common/Breadcrumbs";

export default function AppLayout() {
  const { account, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  const avatarUrl = account?.avatar?.tmdb?.avatar_path
    ? `https://image.tmdb.org/t/p/w45${account.avatar.tmdb.avatar_path}`
    : account?.avatar?.gravatar?.hash
    ? `https://www.gravatar.com/avatar/${account.avatar.gravatar.hash}?s=45`
    : null;

  const Avatar = () => avatarUrl ? (
    <img src={avatarUrl} alt={account?.username} className="app-nav-avatar" />
  ) : (
    <div className="app-nav-avatar-placeholder">
      {account?.username?.[0]?.toUpperCase() ?? "?"}
    </div>
  );

  return (
    <div className="app-layout">
      <header className="app-nav">
        {/* Logo */}
        <NavLink to="/" className="app-nav-logo">CineTrack</NavLink>

        {/* Desktop links */}
        <nav className="app-nav-links">
          <NavLink to="/movies">Movies</NavLink>
          <NavLink to="/tv">TV</NavLink>
          <NavLink to="/watchlist">Watchlist</NavLink>
        </nav>

        {/* Desktop search */}
        <div className="app-nav-search-wrap">
          <SearchBar />
        </div>

        {/* Desktop user controls */}
        <div className="app-nav-user">
          <ThemeToggle />
          <Avatar />
          <span className="app-nav-username">{account?.username}</span>
          <button className="app-nav-logout" onClick={handleLogout}>Sign out</button>
        </div>

        {/* Mobile: hamburger */}
        <button
          className={`app-nav-hamburger ${menuOpen ? "app-nav-hamburger--open" : ""}`}
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          <span /><span /><span />
        </button>
      </header>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="mobile-drawer" onClick={(e) => e.target === e.currentTarget && setMenuOpen(false)}>
          <div className="mobile-drawer-panel">
            {/* User info */}
            <div className="mobile-drawer-user">
              <Avatar />
              <div>
                <p className="mobile-drawer-username">{account?.name || account?.username}</p>
                <p className="mobile-drawer-handle">@{account?.username}</p>
              </div>
            </div>

            {/* Search */}
            <div className="mobile-drawer-search">
              <SearchBar onNavigate={() => setMenuOpen(false)} />
            </div>

            {/* Nav links */}
            <nav className="mobile-drawer-links">
              <NavLink to="/" className="mobile-drawer-link">Home</NavLink>
              <NavLink to="/movies" className="mobile-drawer-link">Movies</NavLink>
              <NavLink to="/tv" className="mobile-drawer-link">TV</NavLink>
              <NavLink to="/watchlist" className="mobile-drawer-link">Watchlist</NavLink>
              <NavLink to="/search" className="mobile-drawer-link">Search</NavLink>
            </nav>

            <div className="mobile-drawer-footer">
              <ThemeToggle />
              <button className="app-nav-logout" onClick={handleLogout}>Sign out</button>
            </div>
          </div>
        </div>
      )}

      <main className="app-main">
        <Breadcrumbs />
        <Outlet />
      </main>
    </div>
  );
}
