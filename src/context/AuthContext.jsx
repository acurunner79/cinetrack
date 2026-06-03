import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import {
  createSession,
  deleteSession,
  getAccount,
  getRequestToken,
  getStoredSession,
  redirectToTmdbAuth,
} from "../api/auth";
import { STORAGE_KEYS } from "../constants/tmdb";

// -------------------------------------------------------------------
// State shape
// -------------------------------------------------------------------
const initialState = {
  status: "idle",      // "idle" | "loading" | "authenticated" | "error"
  sessionId: null,
  account: null,
  error: null,
};

// -------------------------------------------------------------------
// Reducer
// -------------------------------------------------------------------
function authReducer(state, action) {
  switch (action.type) {
    case "LOADING":
      return { ...state, status: "loading", error: null };

    case "AUTHENTICATED":
      return {
        status: "authenticated",
        sessionId: action.sessionId,
        account: action.account,
        error: null,
      };

    case "ERROR":
      return {
        ...state,
        status: "error",
        error: action.error,
      };

    case "LOGGED_OUT":
      return { ...initialState, status: "idle" };

    default:
      return state;
  }
}

// -------------------------------------------------------------------
// Context
// -------------------------------------------------------------------
const AuthContext = createContext(null);

// -------------------------------------------------------------------
// Provider
// -------------------------------------------------------------------
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // -----------------------------------------------------------------
  // On mount — restore any persisted session
  // -----------------------------------------------------------------
  useEffect(() => {
    async function restoreSession() {
      const stored = getStoredSession();
      if (!stored) {
        dispatch({ type: "LOGGED_OUT" });
        return;
      }

      dispatch({ type: "LOADING" });
      try {
        const account = await getAccount(stored.sessionId);
        // Refresh stored accountId in case it changed
        localStorage.setItem(STORAGE_KEYS.accountId, account.id);
        dispatch({
          type: "AUTHENTICATED",
          sessionId: stored.sessionId,
          account,
        });
      } catch {
        // Stored session is stale — clear it silently
        localStorage.removeItem(STORAGE_KEYS.sessionId);
        localStorage.removeItem(STORAGE_KEYS.accountId);
        dispatch({ type: "LOGGED_OUT" });
      }
    }

    restoreSession();
  }, []);

  // -----------------------------------------------------------------
  // login() — starts the 3-step TMDb auth flow
  // Step 1: get request token
  // Step 2: redirect user to TMDb (browser navigates away)
  // Step 3: handled in CallbackPage after TMDb redirects back
  // -----------------------------------------------------------------
  const login = useCallback(async () => {
    dispatch({ type: "LOADING" });
    try {
      const token = await getRequestToken();
      const callbackUrl = `${window.location.origin}/callback`;
      redirectToTmdbAuth(token, callbackUrl);
      // Execution stops here — browser has navigated away
    } catch (err) {
      dispatch({ type: "ERROR", error: err.message });
    }
  }, []);

  // -----------------------------------------------------------------
  // handleCallback() — called by CallbackPage once TMDb redirects back
  // Receives the approved request_token from the URL search params
  // -----------------------------------------------------------------
  const handleCallback = useCallback(async (requestToken) => {
    dispatch({ type: "LOADING" });
    try {
      const sessionId = await createSession(requestToken);
      const account = await getAccount(sessionId);
      localStorage.setItem(STORAGE_KEYS.accountId, account.id);
      dispatch({ type: "AUTHENTICATED", sessionId, account });
      return { success: true };
    } catch (err) {
      dispatch({ type: "ERROR", error: err.message });
      return { success: false, error: err.message };
    }
  }, []);

  // -----------------------------------------------------------------
  // logout() — invalidates session server-side + clears local state
  // -----------------------------------------------------------------
  const logout = useCallback(async () => {
    if (state.sessionId) {
      await deleteSession(state.sessionId).catch(() => {
        // Best-effort; local state is cleared regardless
      });
    }
    dispatch({ type: "LOGGED_OUT" });
  }, [state.sessionId]);

  // -----------------------------------------------------------------
  // Derived flags for convenient use in components
  // -----------------------------------------------------------------
  const value = useMemo(
    () => ({
      ...state,
      isLoading: state.status === "loading",
      isAuthenticated: state.status === "authenticated",
      login,
      logout,
      handleCallback,
    }),
    [state, login, logout, handleCallback]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// -------------------------------------------------------------------
// Hook
// -------------------------------------------------------------------
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
