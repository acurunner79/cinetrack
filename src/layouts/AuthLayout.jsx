import { Outlet } from "react-router-dom";

// Minimal shell for unauthenticated pages — no nav, just a centered card
export default function AuthLayout() {
  return (
    <div className="auth-layout">
      <Outlet />
    </div>
  );
}
