import { useState } from "react";
import PlayIcon from "@assets/play.svg";
import StopIcon from "@assets/stop.svg";

interface ReplayButtonProps {
  onReplay: () => void;
  isReplaying: boolean;
  onStopReplay: () => void;
  onSpeedChange: (speed: number) => void;
}

export const ReplayButton = ({
  onReplay,
  isReplaying,
  onStopReplay,
  onSpeedChange,
}: ReplayButtonProps) => {
  const [showSpeeds, setShowSpeeds] = useState(false);
  const speeds: { name: string; duration: number }[] = [
    { name: "Fastest", duration: 10 },
    { name: "Fast", duration: 25 },
    { name: "Normal", duration: 50 },
    { name: "Slow", duration: 100 },
    { name: "Slowest", duration: 200 },
  ];

  return (
    <div className="absolute bottom-4 left-4 flex flex-col gap-2 items-start">
      <div
        className={`flex flex-col bg-gray-100 dark:bg-gray-800 rounded-md shadow-md overflow-hidden w-max ${
          showSpeeds ? "h-40" : "h-0"
        } transition-[height] duration-200`}
      >
        {Object.values(speeds).map((speed) => (
          <button
            key={speed.name}
            className="text-sm p-2 font-extrabold flex justify-start items-center text-gray-600 dark:text-gray-200 h-8 hover:cursor-pointer hover:bg-gray-800 dark:hover:bg-gray-300 hover:text-white dark:hover:text-gray-900"
            onClick={() => {
              onSpeedChange(speed.duration);
              setShowSpeeds(false);
              onReplay();
            }}
          >
            {speed.name.toUpperCase()}
          </button>
        ))}
      </div>
      {isReplaying ? (
        <button
          className="cursor-pointer w-10 h-10 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-md shadow-md"
          onClick={onStopReplay}
        >
          <img src={StopIcon} alt="stop" className="dark:invert" />
        </button>
      ) : (
        <button
          className="cursor-pointer w-10 h-10 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-md shadow-md"
          onClick={() => setShowSpeeds(!showSpeeds)}
        >
          <img src={PlayIcon} alt="play" className="dark:invert" />
        </button>
      )}
    </div>
  );
};
