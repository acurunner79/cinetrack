import { useEffect, useReducer, useRef } from "react";
import { searchMulti } from "../api/search";

const DEBOUNCE_MS = 350;

function reducer(state, action) {
  switch (action.type) {
    case "LOADING":
      return { ...state, loading: true, error: null };
    case "SUCCESS":
      return { loading: false, error: null, results: action.results, total: action.total };
    case "ERROR":
      return { loading: false, error: action.error, results: [], total: 0 };
    case "CLEAR":
      return { loading: false, error: null, results: [], total: 0 };
    default:
      return state;
  }
}

// -------------------------------------------------------------------
// useSearch(query, page?)
//
// Debounces the query, fires searchMulti, and returns results.
// Safe to call on every keystroke.
//
// Returns { results, total, loading, error }
// -------------------------------------------------------------------
export function useSearch(query, page = 1) {
  const [state, dispatch] = useReducer(reducer, {
    loading: false,
    error: null,
    results: [],
    total: 0,
  });

  const abortRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    // Clear immediately if query is empty
    if (!query?.trim()) {
      clearTimeout(timerRef.current);
      abortRef.current?.abort();
      dispatch({ type: "CLEAR" });
      return;
    }

    dispatch({ type: "LOADING" });

    // Debounce
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      searchMulti(query, page)
        .then((data) => {
          if (!controller.signal.aborted) {
            dispatch({
              type: "SUCCESS",
              results: data.results ?? [],
              total: data.total_results ?? 0,
            });
          }
        })
        .catch((err) => {
          if (!controller.signal.aborted) {
            dispatch({ type: "ERROR", error: err.message });
          }
        });
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timerRef.current);
    };
  }, [query, page]);

  return state;
}
