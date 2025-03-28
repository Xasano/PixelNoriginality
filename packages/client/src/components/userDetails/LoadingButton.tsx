import React from "react";

interface LoadingButtonProps {
  isLoading: boolean;
  text: string;
  loadingText: string;
  type: "button" | "submit" | "reset";
  disabled?: boolean;
  variant?: "primary" | "secondary";
  onClick?: () => void;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading,
  text,
  loadingText,
  type,
  disabled,
  variant = "primary",
  onClick,
}) => {
  const getPrimaryClasses = () =>
    "px-4 py-2 bg-blue-500 dark:bg-blue-600 border border-transparent rounded-md text-white hover:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center";

  const getSecondaryClasses = () =>
    "px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <button
      type={type}
      onClick={onClick}
      className={
        variant === "primary" ? getPrimaryClasses() : getSecondaryClasses()
      }
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {loadingText}
        </>
      ) : (
        text
      )}
    </button>
  );
};

export default LoadingButton;
