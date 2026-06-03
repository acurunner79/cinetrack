import { useEffect, useReducer, useRef } from "react";

function reducer(state, action) {
  switch (action.type) {
    case "LOADING":
      return { ...state, loading: true, error: null };
    case "SUCCESS":
      return { loading: false, error: null, data: action.data };
    case "ERROR":
      return { loading: false, error: action.error, data: null };
    default:
      return state;
  }
}

// -------------------------------------------------------------------
// useTmdb(fetchFn, deps)
//
// fetchFn  — an async function that returns data; re-runs when deps change
// deps     — dependency array (same semantics as useEffect)
//
// Returns { data, loading, error, refetch }
//
// Usage:
//   const { data, loading, error } = useTmdb(
//     () => getTrending("all", "day"),
//     []
//   );
// -------------------------------------------------------------------
export function useTmdb(fetchFn, deps = []) {
  const [state, dispatch] = useReducer(reducer, {
    loading: true,
    error: null,
    data: null,
  });

  // Keep a stable ref to fetchFn so we don't re-run on every render
  const fetchRef = useRef(fetchFn);
  useEffect(() => { fetchRef.current = fetchFn; });

  // Abort controller — cancels stale requests when deps change
  const abortRef = useRef(null);

  function run() {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    dispatch({ type: "LOADING" });

    fetchRef.current(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          dispatch({ type: "SUCCESS", data });
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          dispatch({ type: "ERROR", error: err.message ?? "Something went wrong" });
        }
      });
  }

  useEffect(() => {
    run();
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { ...state, refetch: run };
}
