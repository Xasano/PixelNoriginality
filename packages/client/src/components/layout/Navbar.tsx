import { useEffect, useState } from "react";
import { FaUserPlus } from "react-icons/fa";
import { MdLogin } from "react-icons/md";
import { NavLink, useLocation } from "react-router";

export const Navbar = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  // For the theme
  useEffect(() => {
    // Check if the "theme" key exists in localStorage
    if ("theme" in localStorage) {
      if (localStorage.theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      // If there is no "theme" key in localStorage, check the user's device preference
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, []);

  // For the scroll effect
  useEffect(() => {
    setIsScrolled(false);

    const header = document.querySelector("#home-subtitle");

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 120);
    };

    if (header && location.pathname === "/") {
      // Si le subtitle existe et qu'on est sur la page d'accueil, utiliser l'IntersectionObserver API
      const observer = new IntersectionObserver(
        ([entry]) => {
          setIsScrolled(!entry.isIntersecting);
        },
        {
          threshold: 0,
          rootMargin: "-100px 0px 0px 0px",
        }
      );

      observer.observe(header);
      return () => observer.disconnect();
    } else {
      setTimeout(() => {
        handleScroll();
      }, 50);

      window.addEventListener("scroll", handleScroll);

      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [location.pathname]);

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
    localStorage.theme = document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-20 flex justify-center">
      <nav
        className={`
          h-16 flex items-center justify-between px-4
          transition-all duration-200
          ${
            isScrolled
              ? "bg-white dark:bg-black shadow-md rounded-md w-3/4 mt-4"
              : "bg-transparent w-full"
          }
          dark:text-white
        `}
      >
        <div
          className={`flex items-center ${
            isScrolled ? "transition-opacity duration-350" : ""
          } ${
            isScrolled || location.pathname !== "/"
              ? "opacity-100"
              : "opacity-0"
          }`}
        >
          <NavLink to="/">
            <p className="font-bold">PixelNoriginality</p>
          </NavLink>
        </div>
        <div className="flex items-center space-x-4">
          <NavLink to="/login">
            <button className="px-4 py-2 bg-blue-500 text-white rounded-md">
              <MdLogin />
            </button>
          </NavLink>
          <NavLink to="/register">
            <button className="px-4 py-2 bg-green-500 text-white rounded-md">
              <FaUserPlus />
            </button>
          </NavLink>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
            onClick={toggleTheme}
          >
            Theme
          </button>
        </div>
      </nav>
    </div>
  );
};
