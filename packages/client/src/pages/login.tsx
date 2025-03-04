import { useState } from "react";
import { useNavigate, useLocation } from "react-router";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    // Récupérer un message éventuel passé via location state
    const stateMessage = location.state?.message;

    // Récupérer la redirection après connexion si elle existe
    const redirectPath = location.state?.from || '/';

    const validate = () => {
        const newErrors: { email?: string; password?: string } = {};
        if (!email) {
            newErrors.email = "Email est requis";
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "Format d'email invalide";
        }
        if (!password) {
            newErrors.password = "Mot de passe requis";
        }
        return newErrors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validationErrors = validate();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsLoading(true);
        setErrors({});
        setMessage("");

        try {
            const response = await fetch('http://localhost:8000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include', // Pour inclure les cookies
                body: JSON.stringify({ email, password })
            });

            // Récupérer les données de réponse même en cas d'erreur
            const data = await response.json().catch(() => null);

            if (!response.ok) {
                // Traitement spécifique des erreurs d'API
                if (data && data.error) {
                    switch (data.error) {
                        case "WRONG_EMAIL_OR_PASSWORD":
                            throw new Error("Email ou mot de passe incorrect");
                        case "UNAUTHORIZED":
                            throw new Error("Non autorisé, veuillez vous reconnecter");
                        default:
                            throw new Error(data.message || "Échec de la connexion");
                    }
                }
                throw new Error("Une erreur est survenue lors de la connexion");
            }

            setMessage("Connexion réussie!");

            // Redirection après connexion réussie
            setTimeout(() => {
                navigate(redirectPath);
            }, 800);

        } catch (error) {
            let errorMessage = "Une erreur est survenue";
            if (error instanceof Error) {
                errorMessage = error.message;
            }

            // Afficher l'erreur au bon endroit selon le contexte
            if (errorMessage.includes("Email ou mot de passe")) {
                setErrors({
                    general: errorMessage
                });
            } else {
                setErrors({
                    general: errorMessage
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-black">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded shadow-md w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-4 dark:text-white">Connexion</h2>

                {stateMessage && (
                    <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded-md dark:bg-blue-900 dark:text-blue-200">
                        {stateMessage}
                    </div>
                )}

                {message && (
                    <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md dark:bg-green-900 dark:text-green-200">
                        {message}
                    </div>
                )}

                {errors.general && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md dark:bg-red-900 dark:text-red-200">
                        {errors.general}
                    </div>
                )}

                {/* Champ Email */}
                <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        disabled={isLoading}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                {/* Champ Password */}
                <div className="mb-4">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Mot de passe
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        disabled={isLoading}
                    />
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>

                {/* Lien vers la page d'inscription */}
                <div className="mt-2 mb-4 text-sm">
                    <p className="text-gray-600 dark:text-gray-400">
                        Pas encore de compte ?
                        <a
                            href="/register"
                            className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            S'inscrire
                        </a>
                    </p>
                </div>

                {/* Bouton Login */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-blue-300 dark:disabled:bg-blue-800"
                >
                    {isLoading ? "Connexion en cours..." : "Se connecter"}
                </button>
            </form>
        </div>
    );
};

export default Login;