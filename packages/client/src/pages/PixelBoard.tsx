import { Board } from "@components/pixelboard/Board";
import { ColorPicker } from "@components/pixelboard/ColorPicker";
import { Pixel } from "@interfaces/Pixel";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { PixelBoardHeader } from "../components/pixelboard/PixelBoardHeader";
import { IPixelBoard } from "@/interfaces/PixelBoard";

export const PixelBoard = () => {
  const [selectedColor, setSelectedColor] = useState("#ff0000");
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [name, setName] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [participationDelay, setParticipationDelay] = useState<number>(0);
  const [participationTimer, setParticipationTimer] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    fetch(`http://localhost:8000/api/pixel-boards/${id}`)
      .then((res) => res.json())
      .then((data: IPixelBoard) => {
        setPixels(data.pixels);
        setWidth(data.width);
        setHeight(data.height);
        setName(data.title);
        setEndDate(data.endDate);
        setParticipationDelay(data.participationDelay);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [id]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (participationTimer > 0) {
        setParticipationTimer((prev) => prev - 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [participationTimer]);

  return (
    <div className="flex flex-col items-center h-full max-h-full w-full pt-16">
      <div className="flex flex-col gap-2 p-3 items-center w-full h-full">
        <PixelBoardHeader
          name={name}
          endDate={endDate}
          participationTimer={participationTimer}
        />
        <div className="max-w-full flex-1 aspect-square flex flex-col bg-gray-200 dark:bg-gray-700 p-2.5 rounded-xl">
          <Board
            pixelboardId={id!}
            isLoading={isLoading}
            selectedColor={selectedColor}
            width={width}
            height={height}
            pixels={pixels}
            participationTimer={participationTimer}
            addParticipationDelay={() => {
              setParticipationTimer(participationDelay);
            }}
          />
        </div>
      </div>
      <ColorPicker onSelectedColorChange={setSelectedColor} />
    </div>
  );
};
