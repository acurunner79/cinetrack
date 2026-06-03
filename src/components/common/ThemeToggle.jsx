import { useTheme } from "../../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme, THEMES } = useTheme();
  const isTaytay = theme === THEMES.TAYTAY;

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${isTaytay ? "dark" : "Taytay"} theme`}
      title={`Switch to ${isTaytay ? "dark" : "Taytay"} theme`}
    >
      <span className="theme-toggle-icon">{isTaytay ? "🌙" : "✨"}</span>
      <span className="theme-toggle-label">
        {isTaytay ? "Dark" : "Taytay"}
      </span>
    </button>
  );
}
