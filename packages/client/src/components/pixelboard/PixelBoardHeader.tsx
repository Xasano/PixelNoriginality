import { VisitorLimits } from "@/interfaces/VisitorLimits";
import { useEffect, useState } from "react";

interface PixelBoardHeaderProps {
  name: string;
  endDate: string;
  participationTimer: number;
  limits: VisitorLimits | null;
}

export const PixelBoardHeader = (props: PixelBoardHeaderProps) => {
  const { name, endDate, participationTimer, limits } = props;
  const [dateTimer, setDateTimer] = useState<string | undefined>(undefined);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const end = new Date(endDate);
      const diff = end.getTime() - now.getTime();
      if (diff <= 0) {
        setDateTimer("Ended");
      } else {
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setDateTimer(
          `${hours > 0 ? hours + "h " : ""}${minutes > 0 ? minutes + "m " : ""}${seconds > 0 ? seconds + "s " : ""}`,
        );
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [endDate]);

  return (
    <header className="flex w-full justify-between items-center h-16 bg-white text-black dark:bg-gray-950 dark:text-white">
      <div className="flex-1 flex flex-col justify-start items-start">
        <p className="font-light">Name</p>
        <h2 className="font-bold">{name}</h2>
      </div>
      {participationTimer === 0 ? (
        <p className="font-semibold">
          {limits
            ? limits.pixelsRemaining > 0
              ? `✏ You can draw ! (${limits.pixelsRemaining} left)`
              : "Limits reached"
            : "✏ You can draw !"}
        </p>
      ) : (
        <div className="flex flex-col justify-center items-center">
          <p className="font-light">Participation timer</p>
          <p className="font-bold">{participationTimer}</p>
        </div>
      )}
      <div className="flex-1 flex flex-col justify-end items-end">
        <p className="font-light">End timer</p>
        <p className="font-bold">{dateTimer}</p>
      </div>
    </header>
  );
};
