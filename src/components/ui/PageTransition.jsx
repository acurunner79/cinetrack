import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export default function PageTransition({ children }) {
  const location = useLocation();
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Trigger fade-in on route change
    el.classList.remove("page-visible");
    const t = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.classList.add("page-visible");
      });
    });
    return () => cancelAnimationFrame(t);
  }, [location.pathname]);

  return (
    <div ref={ref} className="page-transition">
      {children}
    </div>
  );
}
