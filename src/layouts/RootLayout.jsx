import { Outlet } from "react-router-dom";

// Global error boundary lives here in a real app.
// For MVP this is a thin pass-through; add <ErrorBoundary> around
// <Outlet /> once you build that component.
export default function RootLayout() {
  return <Outlet />;
}
