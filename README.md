# CineTrack — TMDb App

A React app powered by The Movie Database (TMDb) API.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Open `.env` and fill in your TMDb credentials from https://www.themoviedb.org/settings/api:
   - `VITE_TMDB_API_KEY` — your v3 API key
   - `VITE_TMDB_READ_TOKEN` — your v4 Read Access Token (Bearer)

3. **Start the dev server**
   ```bash
   npm run dev
   ```
   App runs at http://localhost:5173

## Auth Flow

Login uses TMDb's 3-step token flow:
1. App requests a token → redirects you to themoviedb.org to approve
2. TMDb redirects back to `/callback?request_token=...&approved=true`
3. App exchanges the token for a `session_id` and fetches your account

## Project Structure

```
src/
  api/
    client.js        # Base fetch wrapper (v3 + v4)
    auth.js          # Token flow, session management
  constants/
    tmdb.js          # URLs, image sizes, storage keys
  context/
    AuthContext.jsx  # Global auth state + login/logout
  layouts/
    RootLayout.jsx
    AuthLayout.jsx   # Centered card for login pages
    AppLayout.jsx    # Nav + outlet for app pages
  pages/
    auth/
      LoginPage.jsx
      CallbackPage.jsx
    home/
      HomePage.jsx
  components/
    common/
      ProtectedRoute.jsx
  index.css
  main.jsx
  App.jsx            # All routes defined here
```
