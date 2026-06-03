import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "../../components/common/ThemeToggle";

export default function LoginPage() {
  const { login, isAuthenticated, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Where to go after login — default to home
  const from = location.state?.from?.pathname || "/";

  // Already logged in (e.g. hit /login with a valid stored session)
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          {/* Replace with your app logo */}
          <span className="login-logo-text">CineTrack</span>
          <span className="login-logo-sub">powered by TMDb</span>
        </div>

        <p className="login-description">
          Sign in with your TMDb account to track watchlists, rate films, and
          get personalised recommendations.
        </p>

        {error && (
          <div className="login-error" role="alert">
            {error}
          </div>
        )}

        <button
          className="login-button"
          onClick={login}
          disabled={isLoading}
          aria-busy={isLoading}
        >
          {isLoading ? "Redirecting to TMDb…" : "Login with TMDb"}
        </button>

        <p className="login-disclaimer">
          You'll be redirected to themoviedb.org to authorise access, then
          brought back here.
        </p>

        <div style={{ display: "flex", justifyContent: "center", marginTop: "0.25rem" }}>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
