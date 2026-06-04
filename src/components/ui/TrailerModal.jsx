import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

export default function TrailerModal({ videoKey, title, onClose }) {
  // Close on Escape key
  const handleKey = useCallback((e) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [handleKey]);

  if (!videoKey) return null;

  return createPortal(
    <div className="trailer-modal-backdrop" onClick={onClose}>
      <div
        className="trailer-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="trailer-modal-header">
          <p className="trailer-modal-title">{title}</p>
          <button
            className="trailer-modal-close"
            onClick={onClose}
            aria-label="Close trailer"
          >
            ✕
          </button>
        </div>
        <div className="trailer-modal-frame-wrap">
          <iframe
            className="trailer-modal-frame"
            src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0&modestbranding=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
