# CineTrack

A full-featured movie and TV tracking app built with React, powered by [The Movie Database (TMDb) API](https://www.themoviedb.org/documentation/api). Browse movies and TV shows, search across all content types, manage your watchlist, and explore cast and crew — all with a dark theme and a custom "Taytay" light theme inspired by Taylor Swift's *The Life of a Showgirl* album.

---

## Features

### Authentication
- Full TMDb v3 three-step token auth flow — request token, user approval on TMDb, session exchange
- Session persisted to `localStorage` and restored on page load
- Protected routes redirect unauthenticated users to login
- Logout invalidates the session server-side

### Home Page
- Full-bleed hero banner using the top trending backdrop of the day
- Four horizontal shelves: Trending Today, Now in Cinemas, Top Rated Movies, Airing on TV Today
- Personalised greeting using the logged-in account name

### Browse
- Dedicated `/movies` and `/tv` browse pages powered by TMDb's Discover API
- Sort by: Most Popular, Top Rated, Newest First, Oldest First, Highest Grossing
- Filter by genre via dropdown or quick-select pill row
- All filter state lives in the URL — bookmarkable and shareable
- Paginated results up to TMDb's 500-page cap

### Search
- Debounced live search bar in the nav with an instant dropdown (up to 6 results with poster thumbnails)
- Full `/search` results page with All / Movies / TV / People tabs
- Each tab backed by the appropriate TMDb endpoint
- Paginated results with tab and query state preserved in the URL

### Movie Detail
- Full-bleed backdrop hero with poster, genres, runtime, rating, vote count, and tagline
- Trailer button linking to the official YouTube trailer
- Horizontal cast scroller with headshots and character names
- Streaming, rent, and buy providers for the US region
- "More like this" recommendations shelf
- Watchlist toggle button

### TV Detail
- Same hero layout as movies with show-specific metadata: season count, year range, network, status badge (Returning / Ended / Canceled)
- Seasons accordion — click any season to lazily fetch and expand its full episode list
- Each episode shows a still image, episode number, air date, runtime, rating, and overview
- Cast scroller, trailer button, providers, watchlist toggle, and recommendations

### People
- Profile photo, department, birthdate, birthplace, age, and death date when applicable
- External links to IMDb, Instagram, and personal website when available
- Biography with read more / show less toggle for long bios
- "Known for" horizontal shelf of top credits
- Full filmography grid with Acting and Crew tabs, sorted newest first and deduped

### Watchlist
- Add / remove any movie or TV show with a single tap from cards or detail pages
- Optimistic UI updates — the button state changes instantly, rolls back on failure
- `/watchlist` page with Movies and TV tabs, count badges, and backdrop-accented list cards
- Watchlist loaded from TMDb on login and kept in sync across the app via context

### Themes
- **Dark** — default dark theme with TMDb teal accent
- **Taytay** — light theme inspired by Taylor Swift's *The Life of a Showgirl*: pearlescent cream backgrounds, glitter orange accent, champagne gold borders, mint green highlights, serif typography
- Theme persisted to `localStorage` and applied via `data-theme` on `<html>`
- Toggle available in the nav bar and on the login page

### Responsive Design
- Fully responsive across desktop, tablet, and mobile
- Mobile nav collapses to a hamburger button with a slide-in drawer
- Drawer includes search, all nav links, theme toggle, and sign out
- Hero banners, detail pages, grids, and shelves all adapt to screen size

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 |
| Routing | React Router v6 (nested layouts) |
| Build tool | Vite |
| Styling | Plain CSS with CSS custom properties |
| State | React Context + useReducer |
| Data fetching | Custom `useTmdb` hook with abort controllers |
| API | TMDb v3 (content) + v4 (auth) |
| Deployment | Netlify |

---

## Project Structure

```
src/
  api/
    client.js           # Base fetch wrapper — v3 API key + v4 Bearer token
    auth.js             # TMDb 3-step token flow, session management
    media.js            # Movies, TV, seasons, episodes, people, discover
    search.js           # Multi-search, typed search endpoints
    account.js          # Watchlist, favorites, ratings CRUD
    config.js           # /configuration fetch with 24hr localStorage cache
  constants/
    tmdb.js             # Base URLs, image sizes, storage keys, auth endpoints
  context/
    AuthContext.jsx     # Session state, login, logout, handleCallback
    ThemeContext.jsx    # Theme toggle, persisted to localStorage
    WatchlistContext.jsx # Watchlist state with optimistic updates
  hooks/
    useTmdb.js          # Generic fetch hook with loading/error/data + abort
    useSearch.js        # Debounced multi-search hook
  layouts/
    RootLayout.jsx      # Top-level providers wrapper
    AuthLayout.jsx      # Centered card shell for login/callback
    AppLayout.jsx       # Sticky nav + mobile drawer + <Outlet>
  pages/
    auth/
      LoginPage.jsx
      CallbackPage.jsx
    home/
      HomePage.jsx
    browse/
      BrowsePage.jsx    # Shared discover page (movies + TV)
    movies/
      MoviesPage.jsx
      MovieDetailPage.jsx
    tv/
      TvPage.jsx
      TvDetailPage.jsx
    people/
      PersonPage.jsx
    search/
      SearchPage.jsx
    account/
      WatchlistPage.jsx
  components/
    common/
      ProtectedRoute.jsx
      MediaCard.jsx       # Poster card for movies, TV, people
      MediaShelf.jsx      # Horizontal scrolling shelf with heading
      WatchlistButton.jsx # sm / md / lg variants with optimistic state
      RatingBadge.jsx     # Color-coded vote_average pill
      Spinner.jsx
      ThemeToggle.jsx
    media/
      CastScroller.jsx
      TrailerButton.jsx
      ProviderGrid.jsx    # Stream / rent / buy logos
      SeasonAccordion.jsx # Lazy-loaded episode list per season
    nav/
      SearchBar.jsx       # Debounced input with instant dropdown
  utils/
    tmdbImage.js          # URL builders, srcSet helpers, placeholders, ConfigProvider
  index.css               # All styles — both themes, all components, responsive breakpoints
  main.jsx
  App.jsx                 # All routes defined here
```

---

## Setup

### Prerequisites
- Node.js 18+
- A free TMDb account — [register here](https://www.themoviedb.org/signup)

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
```bash
cp .env.example .env
```

Open `.env` and add your TMDb credentials from [https://www.themoviedb.org/settings/api](https://www.themoviedb.org/settings/api):

```
VITE_TMDB_API_KEY=your_v3_api_key_here
VITE_TMDB_READ_TOKEN=your_v4_read_access_token_here
```

Both are available on your TMDb API settings page. The API key is labeled **API Key (v3 auth)** and the read token is labeled **API Read Access Token (v4 auth)**.

### 3. Start the dev server
```bash
npm run dev
```

App runs at [http://localhost:5173](http://localhost:5173)

### 4. Build for production
```bash
npm run build
```

---

## API Notes

### TMDb versions
- **v3** is used for all content endpoints (movies, TV, people, search, discover, account)
- **v4** Bearer token is available for future user-level operations

### Image URLs
TMDb returns image paths (e.g. `/abc123.jpg`) rather than full URLs. The `tmdbImage.js` utility fetches the base URL from `/configuration` on app load, caches it for 24 hours, and provides typed helpers:

```js
import { posterUrl, backdropUrl, profileUrl, posterSrcSet } from "./utils/tmdbImage";

<img
  src={posterUrl(movie.poster_path, "md")}
  srcSet={posterSrcSet(movie.poster_path)}
  sizes="(max-width: 600px) 185px, 342px"
  onError={(e) => { e.target.src = placeholders.poster; }}
/>
```

### append_to_response
Detail pages use TMDb's `append_to_response` parameter to pack multiple sub-requests into a single API call:

```
/movie/:id?append_to_response=credits,videos,watch_providers,recommendations,similar
```

This keeps the detail page to one network request regardless of how many data sections are shown.

---

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_TMDB_API_KEY` | TMDb v3 API key — used for all content + auth endpoints |
| `VITE_TMDB_READ_TOKEN` | TMDb v4 Read Access Token — available for future v4 endpoints |