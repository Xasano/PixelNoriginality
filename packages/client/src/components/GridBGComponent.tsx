import { ReactNode } from "react";

interface GridBGComponentProps {
  children?: ReactNode;
}

const GridBGComponent = ({ children }: GridBGComponentProps) => {
  return (
    <div className="relative w-full h-full bg-[#FFF7E4] dark:bg-black">
      {/* Grille de base */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#333333_1px,transparent_1px),linear-gradient(to_bottom,#333333_1px,transparent_1px)] bg-[size:20px_20px]" />

      {/* Effet de vignette radiale */}
      <div className="absolute inset-0 bg-radial-fading from-transparent via-white/70 to-white dark:via-black/70 dark:to-black" />

      {/* Conteneur de contenu */}
      <div className="absolute inset-0 z-10 h-full">{children}</div>
    </div>
  );
};

export default GridBGComponent;
