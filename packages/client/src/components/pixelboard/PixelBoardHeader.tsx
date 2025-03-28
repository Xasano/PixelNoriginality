import { useEffect, useState } from "react";

interface PixelBoardHeaderProps {
  name: string;
  endDate: string;
  participationTimer: number;
}

export const PixelBoardHeader = (props: PixelBoardHeaderProps) => {
  const { name, endDate, participationTimer } = props;
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
        setDateTimer(`${hours}:${minutes}:${seconds}`);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [endDate]);

  return (
    <header className="flex w-full justify-between items-center h-16 bg-white text-black dark:bg-gray-800 dark:text-white">
      <div className="flex flex-col justify-start items-start">
        <p className="font-light">Name</p>
        <h2 className="font-bold">{name}</h2>
      </div>
      {participationTimer === 0 ? (
        <p className="font-semibold">✏ You can draw !</p>
      ) : (
        <div className="flex flex-col justify-center items-center">
          <p className="font-light">Participation timer</p>
          <p className="font-bold">{participationTimer}</p>
        </div>
      )}
      <div className="flex flex-col justify-end items-end">
        <p className="font-light">End timer</p>
        <p className="font-bold">{dateTimer}</p>
      </div>
    </header>
  );
};
