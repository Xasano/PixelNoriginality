import { useState } from "react";
import SaveIcon from "../../assets/save.svg";

interface ExportButtonProps {
  onExport: (type: "svg" | "png") => void;
}

export const ExportButton = (props: ExportButtonProps) => {
  const { onExport } = props;
  const types: ("svg" | "png")[] = ["svg", "png"];
  const [showTypes, setShowTypes] = useState(false);

  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-2 items-end">
      <div
        className={`flex flex-col bg-gray-100 dark:bg-gray-800 rounded-md shadow-md overflow-hidden w-15 ${
          showTypes ? "h-16" : "h-0"
        } transition-[height] duration-200`}
      >
        {Object.values(types).map((type) => (
          <button
            key={type}
            className="text-sm p-2 font-extrabold flex justify-center items-center text-gray-600 dark:text-gray-200 h-8 hover:cursor-pointer hover:bg-gray-800 dark:hover:bg-gray-300 hover:text-white dark:hover:text-gray-900"
            onClick={() => {
              onExport(type);
              setShowTypes(false);
            }}
          >
            {type.toUpperCase()}
          </button>
        ))}
      </div>
      <button
        className="cursor-pointer w-10 h-10 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-md shadow-md"
        onClick={() => setShowTypes(!showTypes)}
      >
        <img src={SaveIcon} alt="save" className="dark:invert" />
      </button>
    </div>
  );
};
