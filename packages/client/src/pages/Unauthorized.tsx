const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        {/* Icône X customisée en SVG inline */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 text-red-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Accès Refusé
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Désolé, vous n'avez pas les autorisations nécessaires pour accéder à
          cette page.
        </p>

        <div className="flex flex-col space-y-4">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            onClick={() => window.history.back()}
          >
            Retour en arrière
          </button>

          <button
            className="bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-md border border-gray-300 dark:border-gray-600 transition-colors duration-200"
            onClick={() => (window.location.href = "/")}
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
