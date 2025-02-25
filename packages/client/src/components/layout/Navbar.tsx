import { useEffect, useState } from "react";
import { NavLink } from "react-router";
import { MdLogin } from "react-icons/md";
import { FaUserPlus } from "react-icons/fa";


export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHomePage, setIsHomePage] = useState(true);

  useEffect(() => {
    // load theme from localStorage
    if (localStorage.theme === "dark" && "theme" in localStorage) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    const header = document.querySelector("#home-subtitle");

    if (header) {
      // If the subtitle exists, use the IntersectionObserver API
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
      // If not, use the scroll event
      setIsHomePage(false);
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 120);
      };

      // Vérifier la position initiale
      handleScroll();

      // Ajouter l'écouteur d'événement
      window.addEventListener("scroll", handleScroll);

      // Nettoyer l'écouteur
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, []);

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
          } ${isScrolled || !isHomePage ? "opacity-100" : "opacity-0"}`}
        >
          <NavLink to="/">
            <p className="font-bold">PixelNoriginality</p>
          </NavLink>
        </div>
        <div className="flex items-center space-x-4">
          <NavLink to="/pages/login">
            <button className="px-4 py-2 bg-blue-500 text-white rounded-md">
              <MdLogin />
            </button>
          </NavLink>
          <NavLink to="/pages/register">
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
