import { useCallback, useEffect, useReducer, useRef } from "react";

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
        loading:   false,
        items,
        page:      action.page,
        totalPages: action.totalPages,
        hasMore:   action.page < action.totalPages,
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

// -------------------------------------------------------------------
// useInfiniteScroll(fetchFn, deps)
//
// fetchFn(page) — async function that returns { results, total_pages }
// deps          — reset accumulator when these change (e.g. [sort, genre])
//
// Returns:
//   { items, loading, error, hasMore, sentinelRef }
//
// Place <div ref={sentinelRef} /> at the bottom of your list.
// When it enters the viewport the next page is fetched automatically.
// -------------------------------------------------------------------
export function useInfiniteScroll(fetchFn, deps = []) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const fetchRef  = useRef(fetchFn);
  const abortRef  = useRef(null);
  const pageRef   = useRef(0);

  useEffect(() => { fetchRef.current = fetchFn; });

  // Reset when deps change (filter/sort change)
  useEffect(() => {
    abortRef.current?.abort();
    pageRef.current = 0;
    dispatch({ type: "RESET" });
    loadNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  function loadNext() {
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
          results:    data.results ?? [],
          page:       nextPage,
          totalPages: Math.min(data.total_pages ?? 1, 500),
        });
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        dispatch({ type: "FETCH_ERROR", error: err.message });
      });
  }

  // Intersection Observer — watches the sentinel element
  const sentinelRef = useCallback((node) => {
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !state.loading && state.hasMore) {
          loadNext();
        }
      },
      { rootMargin: "200px" }  // start loading 200px before sentinel is visible
    );
    observer.observe(node);
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.loading, state.hasMore]);

  return { ...state, sentinelRef };
}
