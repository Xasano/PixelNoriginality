import { useEffect, useState } from "react";
import {
  FaUserPlus,
  FaPlusCircle,
  FaCog,
  FaUser,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { MdLogin, MdLogout } from "react-icons/md";
import { BsMoonFill, BsSunFill } from "react-icons/bs";
import { NavLink, useLocation, useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Utiliser le contexte d'authentification
  const { isLoggedIn, isAdmin, logout } = useAuth();

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
      const observer = new IntersectionObserver(
        ([entry]) => {
          setIsScrolled(!entry.isIntersecting);
        },
        {
          threshold: 0,
          rootMargin: "-100px 0px 0px 0px",
        },
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
      navigate("/"); // Redirection vers la page d'accueil après déconnexion
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  // Détermine si le thème actuel est sombre
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    setIsDarkTheme(document.documentElement.classList.contains("dark"));
  }, []);

  // Mettre à jour isDarkTheme quand le thème change
  const handleThemeToggle = () => {
    toggleTheme();
    setIsDarkTheme(!isDarkTheme);
  };

  // Vérifier si on est sur la page de profil
  const isProfilePage = location.pathname === "/me";

  // Style commun pour tous les boutons
  const buttonClass =
    "p-2 rounded-full hover:bg-gray-200/60 dark:hover:bg-gray-800/60 transition-all duration-200";

  return (
    <div className="fixed top-0 left-0 right-0 z-20 flex justify-center">
      <nav
        className={`
          h-16 flex items-center justify-between px-4
          transition-all duration-200
          ${
            isScrolled
              ? "bg-white/95 dark:bg-black/95 backdrop-blur-sm shadow-md rounded-md w-full sm:w-11/12 md:w-5/6 lg:w-3/4 mt-4"
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
              {isAdmin ? "(admin)" : "(utilisateur)"}
            </span>
          )}
        </div>

        {/* Bouton hamburger pour mobile */}
        <button
          className="sm:hidden flex items-center justify-center p-2 rounded-full hover:bg-gray-200/60 dark:hover:bg-gray-800/60"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Menu mobile */}
        <div
          className={`z-50 sm:hidden absolute top-16 right-0 bg-white dark:bg-gray-900 shadow-lg rounded-bl-lg p-2 transition-transform duration-300 transform ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex flex-col space-y-2 p-2">
            {isAdmin && (
              <>
                <NavLink to="/pixel-boards/create">
                  <button className="gap-x-2 flex items-center w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                    <FaPlusCircle />
                    <span>Créer un PixelBoard</span>
                  </button>
                </NavLink>
                <NavLink to="/pixel-boards">
                  <button className="gap-x-2 flex items-center w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                    <FaCog />
                    <span>Administration</span>
                  </button>
                </NavLink>
              </>
            )}

            {isLoggedIn ? (
              <>
                {!isProfilePage && (
                  <NavLink to="/me">
                    <button className="gap-x-2 flex items-center w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                      <FaUser />
                      <span>Mon profil</span>
                    </button>
                  </NavLink>
                )}
                <button
                  className="gap-x-2 flex items-center w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={handleLogout}
                >
                  <MdLogout />
                  <span>Se déconnecter</span>
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login">
                  <button className="gap-x-2 flex items-center w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                    <MdLogin />
                    <span>Se connecter</span>
                  </button>
                </NavLink>
                <NavLink to="/register">
                  <button className="gap-x-2 flex items-center w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                    <FaUserPlus />
                    <span>S'inscrire</span>
                  </button>
                </NavLink>
              </>
            )}

            <button
              className="gap-x-2 flex items-center w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={handleThemeToggle}
            >
              {isDarkTheme ? (
                <>
                  <BsSunFill />
                  <span>Thème clair</span>
                </>
              ) : (
                <>
                  <BsMoonFill />
                  <span>Thème sombre</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Boutons pour écrans plus grands */}
        <div className="hidden sm:flex items-center space-x-1 sm:space-x-2 md:space-x-3">
          {/* Afficher le bouton "Créer un PixelBoard" uniquement pour les administrateurs */}
          {isAdmin && (
            <NavLink to="/pixel-boards/create">
              <button className={buttonClass} title="Créer un PixelBoard">
                <FaPlusCircle />
              </button>
            </NavLink>
          )}

          {/* Afficher le bouton "Administration" uniquement pour les administrateurs */}
          {isAdmin && (
            <NavLink to="/pixel-boards">
              <button className={buttonClass} title="Administration">
                <FaCog />
              </button>
            </NavLink>
          )}

          {isLoggedIn ? (
            // Utilisateur connecté
            <>
              {/* Bouton pour accéder au profil - ne pas afficher si on est déjà sur /me */}
              {!isProfilePage && (
                <NavLink to="/me">
                  <button className={buttonClass} title="Mon profil">
                    <FaUser />
                  </button>
                </NavLink>
              )}
              <button
                className={buttonClass}
                onClick={handleLogout}
                title="Se déconnecter"
              >
                <MdLogout />
              </button>
            </>
          ) : (
            // Utilisateur non connecté
            <>
              <NavLink to="/login">
                <button className={buttonClass} title="Se connecter">
                  <MdLogin />
                </button>
              </NavLink>
              <NavLink to="/register">
                <button className={buttonClass} title="S'inscrire">
                  <FaUserPlus />
                </button>
              </NavLink>
            </>
          )}

          {/* Bouton thème */}
          <button
            className={buttonClass}
            onClick={handleThemeToggle}
            title={
              isDarkTheme ? "Passer au thème clair" : "Passer au thème sombre"
            }
          >
            {isDarkTheme ? <BsSunFill /> : <BsMoonFill />}
          </button>
        </div>
      </nav>
    </div>
  );
};
