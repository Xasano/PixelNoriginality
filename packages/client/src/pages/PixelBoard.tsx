import { useEffect, useState } from "react";
import { Board, Pixel } from "../components/pixelboard/Board";
import { ColorPicker } from "../components/pixelboard/ColorPicker";
import { useParams } from "react-router";

export const PixelBoard = () => {
  const [selectedColor, setSelectedColor] = useState("#ff0000");
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const id = useParams().id;

  useEffect(() => {
    fetch(`http://localhost:8000/api/pixel-boards/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setPixels(data.pixels);
        setWidth(data.width);
        setHeight(data.height);
        setIsLoading(false);
      });
  }, [id]);

  return (
    <div className="flex flex-col items-center h-full w-full pt-16">
      <div className="flex flex-col gap-2 p-3 items-center w-full h-full">
        <div className="flex flex-col gap-2 rounded">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Click = draw
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Shift + click (hold) + slide = move the board
          </span>
        </div>
        <div className="max-w-full h-full aspect-square flex flex-col bg-gray-200 dark:bg-gray-700 p-2.5 rounded-xl">
          <Board
            pixelboardId={id!}
            isLoading={isLoading}
            selectedColor={selectedColor}
            width={width}
            height={height}
            pixels={pixels}
          />
        </div>
      </div>
      <ColorPicker onSelectedColorChange={setSelectedColor} />
    </div>
  );
};
