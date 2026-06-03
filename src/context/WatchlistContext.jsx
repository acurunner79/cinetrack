import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} from "../api/account";
import { useAuth } from "./AuthContext";

// -------------------------------------------------------------------
// State shape
// {
//   movies:   array,         — full movie objects for the watchlist page
//   tv:       array,         — full TV objects for the watchlist page
//   movieIds: Set<number>,   — for fast isInWatchlist() lookups
//   tvIds:    Set<number>,
//   loading:  boolean,
//   pending:  Set<string>,   — "movie-123" keys being toggled
//   error:    string|null,
// }
// -------------------------------------------------------------------

const initialState = {
  movies:   [],
  tv:       [],
  movieIds: new Set(),
  tvIds:    new Set(),
  loading:  false,
  pending:  new Set(),
  error:    null,
};

function reducer(state, action) {
  switch (action.type) {
    case "LOADING":
      return { ...state, loading: true, error: null };

    case "LOADED":
      return {
        ...state,
        loading:  false,
        movies:   action.movies,
        tv:       action.tv,
        movieIds: new Set(action.movies.map((m) => m.id)),
        tvIds:    new Set(action.tv.map((t) => t.id)),
      };

    case "ERROR":
      return { ...state, loading: false, error: action.error };

    case "PENDING_ADD": {
      const pending = new Set(state.pending);
      pending.add(action.key);
      return { ...state, pending };
    }

    case "PENDING_REMOVE": {
      const pending = new Set(state.pending);
      pending.delete(action.key);
      return { ...state, pending };
    }

    case "OPTIMISTIC_ADD": {
      const ids = new Set(action.mediaType === "movie" ? state.movieIds : state.tvIds);
      ids.add(action.mediaId);
      // We don't have the full item object here, so lists stay stale until
      // the next full fetch. The ID set is enough for button state.
      return action.mediaType === "movie"
        ? { ...state, movieIds: ids }
        : { ...state, tvIds: ids };
    }

    case "OPTIMISTIC_REMOVE": {
      const ids = new Set(action.mediaType === "movie" ? state.movieIds : state.tvIds);
      ids.delete(action.mediaId);
      // Remove from the full list immediately for the watchlist page
      const listKey = action.mediaType === "movie" ? "movies" : "tv";
      const list = state[listKey].filter((item) => item.id !== action.mediaId);
      return action.mediaType === "movie"
        ? { ...state, movieIds: ids, movies: list }
        : { ...state, tvIds: ids, tv: list };
    }

    case "RESET":
      return { ...initialState };

    default:
      return state;
  }
}

const WatchlistContext = createContext(null);

export function WatchlistProvider({ children }) {
  const { isAuthenticated, sessionId, account } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);

  const accountId = account?.id;

  // Load full watchlist on login — movies + TV in parallel
  useEffect(() => {
    if (!isAuthenticated || !accountId || !sessionId) {
      dispatch({ type: "RESET" });
      return;
    }

    dispatch({ type: "LOADING" });

    Promise.all([
      getWatchlist(accountId, sessionId, "movies"),
      getWatchlist(accountId, sessionId, "tv"),
    ])
      .then(([moviesData, tvData]) => {
        dispatch({
          type:   "LOADED",
          movies: moviesData.results ?? [],
          tv:     tvData.results     ?? [],
        });
      })
      .catch((err) => dispatch({ type: "ERROR", error: err.message }));
  }, [isAuthenticated, accountId, sessionId]);

  const toggle = useCallback(
    async (mediaType, mediaId) => {
      if (!accountId || !sessionId) return;

      const key     = `${mediaType}-${mediaId}`;
      const ids     = mediaType === "movie" ? state.movieIds : state.tvIds;
      const isIn    = ids.has(mediaId);

      dispatch({ type: "PENDING_ADD", key });
      dispatch({ type: isIn ? "OPTIMISTIC_REMOVE" : "OPTIMISTIC_ADD", mediaType, mediaId });

      try {
        if (isIn) {
          await removeFromWatchlist(accountId, sessionId, mediaType, mediaId);
        } else {
          await addToWatchlist(accountId, sessionId, mediaType, mediaId);
        }
      } catch {
        // Roll back
        dispatch({ type: isIn ? "OPTIMISTIC_ADD" : "OPTIMISTIC_REMOVE", mediaType, mediaId });
      } finally {
        dispatch({ type: "PENDING_REMOVE", key });
      }
    },
    [accountId, sessionId, state.movieIds, state.tvIds]
  );

  const value = useMemo(
    () => ({
      ...state,
      toggle,
      isInWatchlist: (mediaType, mediaId) =>
        mediaType === "movie"
          ? state.movieIds.has(mediaId)
          : state.tvIds.has(mediaId),
      isPending: (mediaType, mediaId) =>
        state.pending.has(`${mediaType}-${mediaId}`),
    }),
    [state, toggle]
  );

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const ctx = useContext(WatchlistContext);
  if (!ctx) throw new Error("useWatchlist must be used inside <WatchlistProvider>");
  return ctx;
}
