import { useAuth } from "@hooks/useAuth";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { apiService } from "@/helpers/request";

interface VisitorSessionResponse {
  success: boolean;
  authenticated: boolean;
}

interface VisitorLimitsResponse {
  success: boolean;
  limits: {
    pixelsPlacedToday: number;
    totalPixelsPlaced: number;
  };
}

const Register = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    username?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [message, setMessage] = useState("");

  // États pour la gestion des visiteurs
  const [isVisitor, setIsVisitor] = useState(false);
  const [visitorStats, setVisitorStats] = useState<{
    pixelsPlacedToday: number;
    totalPixelsPlaced: number;
  } | null>(null);
  const [convertingVisitor, setConvertingVisitor] = useState(false);

  const navigate = useNavigate();
  const { register, isLoading } = useAuth();

  // Vérifier si l'utilisateur est un visiteur
  useEffect(() => {
    const checkVisitorStatus = async () => {
      try {
        const response =
          await apiService.get<VisitorSessionResponse>("/visitors/session");
        if (response.success && response.authenticated) {
          setIsVisitor(true);

          // Récupérer les statistiques du visiteur
          const statsResponse =
            await apiService.get<VisitorLimitsResponse>("/visitors/limits");
          if (statsResponse.success) {
            setVisitorStats({
              pixelsPlacedToday: statsResponse.limits.pixelsPlacedToday || 0,
              totalPixelsPlaced: statsResponse.limits.totalPixelsPlaced || 0,
            });
          }
        }
      } catch (error) {
        console.error(
          "Erreur lors de la vérification du statut visiteur:",
          error,
        );
      }
    };

    checkVisitorStatus();
  }, []);

  // Validation des champs
  const validate = () => {
    const newErrors: {
      email?: string;
      username?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!email) {
      newErrors.email = "L'email est requis.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "L'email est invalide.";
    }

    if (!username) {
      newErrors.username = "Le nom d'utilisateur est requis.";
    } else if (username.length < 3) {
      newErrors.username =
        "Le nom d'utilisateur doit contenir au moins 3 caractères.";
    }

    if (!password) {
      newErrors.password = "Le mot de passe est requis.";
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(password)
    ) {
      newErrors.password =
        "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre (sans caractère spécial).";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Veuillez confirmer votre mot de passe.";
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas.";
    }

    return newErrors;
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setMessage("");

    try {
      if (isVisitor) {
        // Mode conversion : visiteur -> utilisateur
        setConvertingVisitor(true);

        await apiService.post("/visitors/convert", {
          name: username,
          email,
          password,
        });

        setMessage(
          `Conversion réussie ! Vos pixels ont été conservés. Redirection...`,
        );
      } else {
        // Inscription normale
        await register(username, email, password);
        setMessage("Inscription réussie ! Redirection...");
      }

      // Redirection après inscription réussie
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      let errorMessage = "Une erreur est survenue lors de l'inscription";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      // Diriger l'erreur vers le bon champ
      if (errorMessage.includes("email")) {
        setErrors({ email: errorMessage });
      } else if (errorMessage.includes("utilisateur")) {
        setErrors({ username: errorMessage });
      } else if (errorMessage.includes("mot de passe")) {
        setErrors({ password: errorMessage });
      } else {
        setErrors({ confirmPassword: errorMessage });
      }
    } finally {
      setConvertingVisitor(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-black">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 p-6 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-4 dark:text-white">
          {isVisitor ? "Convertir votre compte visiteur" : "Inscription"}
        </h2>

        {message && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md dark:bg-green-900 dark:text-green-200">
            {message}
          </div>
        )}

        {/* Message spécial pour les visiteurs */}
        {isVisitor && visitorStats && (
          <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded-md dark:bg-blue-900 dark:text-blue-200">
            <p className="font-medium">Conservez vos contributions !</p>
            <p className="text-sm mt-1">
              {visitorStats.totalPixelsPlaced > 0 ? (
                <>
                  En créant un compte, vous conserverez vos{" "}
                  <span className="font-semibold">
                    {visitorStats.totalPixelsPlaced}
                  </span>{" "}
                  pixels placés (dont{" "}
                  <span className="font-semibold">
                    {visitorStats.pixelsPlacedToday}
                  </span>{" "}
                  aujourd'hui).
                </>
              ) : (
                "En créant un compte, vous pourrez dessiner sans limites !"
              )}
            </p>
          </div>
        )}

        {/* Champ Email */}
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            disabled={isLoading || convertingVisitor}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* Champ Username */}
        <div className="mb-4">
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Nom d'utilisateur
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            disabled={isLoading || convertingVisitor}
          />
          {errors.username && (
            <p className="text-red-500 text-sm mt-1">{errors.username}</p>
          )}
        </div>

        {/* Champ Password */}
        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Mot de passe
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            disabled={isLoading || convertingVisitor}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        {/* Champ Confirmation Password */}
        <div className="mb-4">
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Confirmer le mot de passe
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            disabled={isLoading || convertingVisitor}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* Lien vers la page de connexion */}
        <div className="mt-2 mb-4 text-sm">
          <p className="text-gray-600 dark:text-gray-400">
            Déjà un compte ?{" "}
            <a
              href="/login"
              className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Se connecter
            </a>
          </p>
        </div>

        {/* Bouton Register */}
        <button
          type="submit"
          disabled={isLoading || convertingVisitor}
          className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:bg-green-300 dark:disabled:bg-green-800"
        >
          {isLoading || convertingVisitor
            ? isVisitor
              ? "Conversion en cours..."
              : "Inscription en cours..."
            : isVisitor
              ? "Convertir et conserver mes pixels"
              : "S'inscrire"}
        </button>
      </form>
    </div>
  );
};

export default Register;
