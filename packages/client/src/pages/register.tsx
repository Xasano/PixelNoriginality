import { useState } from "react";
import { useNavigate } from "react-router";

const Register = () => {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState<{ email?: string; username?: string; password?: string; confirmPassword?: string }>({});
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    // Validation des champs
    const validate = () => {
        const newErrors: { email?: string; username?: string; password?: string; confirmPassword?: string } = {};

        if (!email) {
            newErrors.email = "L'email est requis.";
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "L'email est invalide.";
        }

        if (!username) {
            newErrors.username = "Le nom d'utilisateur est requis.";
        } else if (username.length < 3) {
            newErrors.username = "Le nom d'utilisateur doit contenir au moins 3 caractères.";
        }

        if (!password) {
            newErrors.password = "Le mot de passe est requis.";
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(password)) {
            newErrors.password = "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre (sans caractère spécial).";
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

        setIsLoading(true);
        setErrors({});
        setMessage("");

        try {
            const response = await fetch('http://localhost:8000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    name: username,
                    email,
                    password
                })
            });

            if (!response.ok) {
                const errorData = await response.json();

                // Gestion des erreurs spécifiques retournées par l'API
                if (errorData.error === "EMAIL_ALREADY_REGISTERED") {
                    setErrors({ email: "Cet email est déjà utilisé." });
                    return;
                } else if (errorData.error === "USERNAME_ALREADY_TAKEN") {
                    setErrors({ username: "Ce nom d'utilisateur est déjà pris." });
                    return;
                } else if (errorData.error === "INVALID_EMAIL_FORMAT") {
                    setErrors({ email: "Format d'email invalide." });
                    return;
                } else if (errorData.error === "WEAK_PASSWORD") {
                    setErrors({ password: "Mot de passe trop faible." });
                    return;
                }

                throw new Error(errorData.message || "Erreur lors de l'inscription");
            }

            setMessage("Inscription réussie ! Redirection...");

            // Redirection après inscription réussie
            setTimeout(() => {
                navigate('/');
            }, 1500);

        } catch (error) {
            let errorMessage = "Une erreur est survenue lors de l'inscription";
            if (error instanceof Error) {
                errorMessage = error.message;
            }

            setErrors({
                confirmPassword: errorMessage
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-black">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded shadow-md w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-4 dark:text-white">Inscription</h2>
                {message && <p className="text-green-500 mb-4">{message}</p>}

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

                {/* Champ Username */}
                <div className="mb-4">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Nom d'utilisateur
                    </label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        disabled={isLoading}
                    />
                    {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
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

                {/* Champ Confirmation Password */}
                <div className="mb-4">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Confirmer le mot de passe
                    </label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        disabled={isLoading}
                    />
                    {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>

                {/* Bouton Register */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:bg-green-300 dark:disabled:bg-green-800"
                >
                    {isLoading ? "Inscription en cours..." : "S'inscrire"}
                </button>
            </form>
        </div>
    );
};

export default Register;