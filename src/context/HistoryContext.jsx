import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";

const MAX_HISTORY = 20;
const STORAGE_KEY = "tmdb_history";

// -------------------------------------------------------------------
// Each history entry shape:
// { id, mediaType, title, posterPath, href, timestamp }
// -------------------------------------------------------------------

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {}
}

function reducer(state, action) {
  switch (action.type) {
    case "PUSH": {
      // Remove existing entry for this item if present, then prepend
      const filtered = state.filter(
        (e) => !(e.id === action.entry.id && e.mediaType === action.entry.mediaType)
      );
      const next = [action.entry, ...filtered].slice(0, MAX_HISTORY);
      saveToStorage(next);
      return next;
    }
    case "REMOVE": {
      const next = state.filter(
        (e) => !(e.id === action.id && e.mediaType === action.mediaType)
      );
      saveToStorage(next);
      return next;
    }
    case "CLEAR":
      saveToStorage([]);
      return [];
    default:
      return state;
  }
}

const HistoryContext = createContext(null);

export function HistoryProvider({ children }) {
  const [history, dispatch] = useReducer(reducer, [], loadFromStorage);

  const push = useCallback((entry) => {
    dispatch({
      type: "PUSH",
      entry: { ...entry, timestamp: Date.now() },
    });
  }, []);

  const remove = useCallback((mediaType, id) => {
    dispatch({ type: "REMOVE", id, mediaType });
  }, []);

  const clear = useCallback(() => {
    dispatch({ type: "CLEAR" });
  }, []);

  const value = useMemo(
    () => ({ history, push, remove, clear }),
    [history, push, remove, clear]
  );

  return (
    <HistoryContext.Provider value={value}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error("useHistory must be used inside <HistoryProvider>");
  return ctx;
}
