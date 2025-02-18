import { useEffect } from "react";
import "./App.css";

function App() {
  useEffect(() => {
    // load theme from localStorage
    if (localStorage.theme === "dark" && "theme" in localStorage) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
    localStorage.theme = document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
  };

  return (
    <section className="flex flex-col items-center justify-center min-h-screen dark:bg-gray-900 dark:text-white">
      <button onClick={toggleTheme} className="mb-5">
        Toggle theme
      </button>
      <h1>Vite + React</h1>
      <div className="card">
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
    </section>
  );
}

export default App;
