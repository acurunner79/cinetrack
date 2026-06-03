import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// TMDb redirects back here with ?request_token=...&approved=true
// (or ?denied=true if the user declined)
export default function CallbackPage() {
  const [searchParams] = useSearchParams();
  const { handleCallback } = useAuth();
  const navigate = useNavigate();
  const called = useRef(false); // prevent double-fire in React strict mode

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const approved = searchParams.get("approved");
    const denied = searchParams.get("denied");
    const requestToken = searchParams.get("request_token");

    if (denied || !requestToken || approved !== "true") {
      navigate("/login?error=denied", { replace: true });
      return;
    }

    handleCallback(requestToken).then(({ success, error }) => {
      if (success) {
        navigate("/", { replace: true });
      } else {
        navigate(`/login?error=${encodeURIComponent(error)}`, {
          replace: true,
        });
      }
    });
  }, [handleCallback, navigate, searchParams]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        gap: "12px",
      }}
    >
      <span>Completing sign-in…</span>
    </div>
  );
}
