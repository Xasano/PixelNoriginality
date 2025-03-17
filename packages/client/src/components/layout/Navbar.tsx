import { useEffect, useState } from "react";
import { FaUserPlus, FaPlusCircle, FaCog } from "react-icons/fa";
import { MdLogin, MdLogout } from "react-icons/md";
import { BsMoonFill, BsSunFill } from "react-icons/bs";
import { NavLink, useLocation, useNavigate } from "react-router";

// URL de base de l'API
const API_BASE_URL = 'http://localhost:8000/api';
import { useAuth } from "../../contexts/AuthContext";

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  // Utiliser le contexte d'authentification
  const { isLoggedIn, isAdmin, logout, user } = useAuth();

  // Pour le thème
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

  // Pour l'effet de défilement
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

  // Fonction de déconnexion
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  // Détermine si le thème actuel est sombre
  const isDarkTheme = document.documentElement.classList.contains("dark");

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
            {/* Indicateur d'état pour le débogage */}
            {isLoggedIn && (
                <span className="ml-2 text-xs">
                {isAdmin ? '(admin)' : '(utilisateur)'}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {/* Afficher le bouton "Créer un PixelBoard" uniquement pour les administrateurs */}
            {isAdmin && (
                <NavLink to="/pixel-boards/create">
                  <button
                      className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
                      title="Créer un PixelBoard"
                  >
                    <FaPlusCircle />
                  </button>
                </NavLink>
            )}

            {/* Afficher le bouton "Administration" uniquement pour les administrateurs */}
            {isAdmin && (
                <NavLink to="/pixel-boards">
                  <button
                      className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                      title="Administration"
                  >
                    <FaCog />
                  </button>
                </NavLink>
            )}

            {isLoggedIn ? (
                // Utilisateur connecté
                <button
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    onClick={handleLogout}
                    title="Se déconnecter"
                >
                  <MdLogout />
                </button>
            ) : (
                // Utilisateur non connecté
                <>
                  <NavLink to="/login">
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600" title="Se connecter">
                      <MdLogin />
                    </button>
                  </NavLink>
                  <NavLink to="/register">
                    <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600" title="S'inscrire">
                      <FaUserPlus />
                    </button>
                  </NavLink>
                </>
            )}

            {/* Bouton thème */}
            <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                onClick={toggleTheme}
                title={isDarkTheme ? "Passer au thème clair" : "Passer au thème sombre"}
            >
              {isDarkTheme ? <BsSunFill /> : <BsMoonFill />}
            </button>
          </div>
        </nav>
      </div>
  );
};