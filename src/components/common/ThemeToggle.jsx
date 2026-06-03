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
      <img
        className="theme-toggle-icon"
        src={isTaytay ? "/batman.png" : "/taytay.png"}
        alt={isTaytay ? "Batman" : "Taylor Swift"}
      />
      <span className="theme-toggle-label">
        {isTaytay ? "Dark" : "Taytay"}
      </span>
    </button>
  );
}
