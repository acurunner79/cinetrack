import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ConfigProvider } from "./utils/tmdbImage";
import { WatchlistProvider } from "./context/WatchlistContext";

import RootLayout from "./layouts/RootLayout";
import AuthLayout from "./layouts/AuthLayout";
import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";

import LoginPage from "./pages/auth/LoginPage";
import CallbackPage from "./pages/auth/CallbackPage";

// Lazy-load everything post-MVP so the auth bundle stays small
import { lazy, Suspense } from "react";
const HomePage        = lazy(() => import("./pages/home/HomePage"));
const MovieDetailPage = lazy(() => import("./pages/movies/MovieDetailPage"));
const SearchPage      = lazy(() => import("./pages/search/SearchPage"));
const WatchlistPage   = lazy(() => import("./pages/account/WatchlistPage"));

function Loading() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
      Loading…
    </div>
  );
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // ── Unauthenticated shell ──────────────────────────────────
      {
        element: <AuthLayout />,
        children: [
          { path: "/login", element: <LoginPage /> },
          { path: "/callback", element: <CallbackPage /> },
        ],
      },

      // ── Authenticated shell ────────────────────────────────────
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              {
                index: true,
                path: "/",
                element: (
                  <Suspense fallback={<Loading />}>
                    <HomePage />
                  </Suspense>
                ),
              },
              {
                path: "/movies/:id",
                element: (
                  <Suspense fallback={<Loading />}>
                    <MovieDetailPage />
                  </Suspense>
                ),
              },
              {
                path: "/search",
                element: (
                  <Suspense fallback={<Loading />}>
                    <SearchPage />
                  </Suspense>
                ),
              },
              {
                path: "/watchlist",
                element: (
                  <Suspense fallback={<Loading />}>
                    <WatchlistPage />
                  </Suspense>
                ),
              },
              // Future routes — tv, people, account
            ],
          },
        ],
      },

      // Catch-all → home (ProtectedRoute will redirect to /login if needed)
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);

export default function App() {
  return (
    <ThemeProvider>
      <ConfigProvider>
        <AuthProvider>
          <WatchlistProvider>
            <RouterProvider router={router} />
          </WatchlistProvider>
        </AuthProvider>
      </ConfigProvider>
    </ThemeProvider>
  );
}
