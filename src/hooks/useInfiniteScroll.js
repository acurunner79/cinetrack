import { useEffect, useReducer, useRef } from "react";

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS": {
      const items = action.page === 1
        ? action.results
        : [...state.items, ...action.results];
      return {
        ...state,
        loading:    false,
        items,
        page:       action.page,
        totalPages: action.totalPages,
        hasMore:    action.page < action.totalPages,
      };
    }
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.error };
    case "RESET":
      return { ...initialState };
    default:
      return state;
  }
}

const initialState = {
  items:      [],
  page:       0,
  totalPages: 0,
  hasMore:    true,
  loading:    false,
  error:      null,
};

export function useInfiniteScroll(fetchFn, deps = []) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Stable refs — avoid stale closures in the observer
  const fetchRef   = useRef(fetchFn);
  const stateRef   = useRef(state);
  const abortRef   = useRef(null);
  const pageRef    = useRef(0);
  const sentinelEl = useRef(null);
  const observerRef = useRef(null);

  // Keep refs in sync with latest values
  useEffect(() => { fetchRef.current = fetchFn; });
  useEffect(() => { stateRef.current = state; }, [state]);

  function loadNext() {
    // Guard against concurrent fetches
    if (stateRef.current.loading) return;
    if (!stateRef.current.hasMore && pageRef.current > 0) return;

    const nextPage = pageRef.current + 1;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    dispatch({ type: "FETCH_START" });

    fetchRef.current(nextPage)
      .then((data) => {
        if (controller.signal.aborted) return;
        pageRef.current = nextPage;
        dispatch({
          type:       "FETCH_SUCCESS",
          results:    data.results    ?? [],
          page:       nextPage,
          totalPages: Math.min(data.total_pages ?? 1, 500),
        });
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        dispatch({ type: "FETCH_ERROR", error: err.message });
      });
  }

  // Reset + initial load when deps change
  useEffect(() => {
    abortRef.current?.abort();
    pageRef.current = 0;
    dispatch({ type: "RESET" });
    // Small timeout lets RESET render before we start fetching
    const t = setTimeout(() => loadNext(), 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  // Stable sentinel callback ref — attaches observer once, reads fresh state via ref
  function sentinelRef(node) {
    // Disconnect previous observer if sentinel changes
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    sentinelEl.current = node;
    if (!node) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !stateRef.current.loading &&
          stateRef.current.hasMore
        ) {
          loadNext();
        }
      },
      { rootMargin: "300px" }
    );

    observerRef.current.observe(node);
  }

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
      abortRef.current?.abort();
    };
  }, []);

  return { ...state, sentinelRef };
}
