import { useState } from "react";
import CloseIcon from "../../assets/close.png";
import EditIcon from "../../assets/edit.png";

enum Colors {
  BLACK = "#000000",
  WHITE = "#ffffff",
  RED = "#ff0000",
  GREEN = "#00ff00",
  BLUE = "#0000ff",
  YELLOW = "#ffff00",
  CYAN = "#00ffff",
  MAGENTA = "#ff00ff",
  ORANGE = "#ffa500",
  PINK = "#ffc0cb",
  PURPLE = "#800080",
}

interface ColorPickerProps {
  onSelectedColorChange: (color: string) => void;
}

export const ColorPicker = (props: ColorPickerProps) => {
  const [color, setColor] = useState<string | Colors>(Colors.RED);
  const [pickerColor, setPickerColor] = useState<string>("");
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);

  const handleShowColorPicker = () => {
    setShowColorPicker(!showColorPicker);
  };

  const handleChangeColor = (color: string | Colors) => {
    setColor(color);
    props.onSelectedColorChange(color);
  };

  const handleChangePickerColor = (color: string) => {
    setPickerColor(color);
    handleChangeColor(color);
  };

  const generateColorWheel = () => {
    return `conic-gradient(
      red 0deg,
      #ff8000 30deg,
      yellow 60deg,
      #80ff00 90deg,
      lime 120deg,
      #00ff80 150deg,
      cyan 180deg,
      #0080ff 210deg,
      blue 240deg,
      #8000ff 270deg,
      magenta 300deg,
      #ff0080 330deg,
      red 360deg
    )`;
  };

  return (
    <div className="flex flex-col justify-end items-center pb-8">
      <div
        className={`absolute max-w-max gap-3.5 rounded-md shadow flex items-baseline bg-gray-100 dark:bg-gray-600
          transition-[opacity,margin,height,width] duration-[200ms,200ms,200ms,0s] overflow-hidden bottom-[80px]
          ${
            showColorPicker
              ? "w-4/5 opacity-100 mb-3.5 h-[68px]"
              : "w-0 opacity-0 mb-0 h-0 delay-[0s,0s,0s,210ms]"
          }`}
      >
        <div className="flex flex-col pl-3.5">
          <label
            htmlFor="color-picker"
            className="min-w-10 aspect-square rounded-md border-[1px] border-gray-200 dark:border-gray-700 hover:cursor-pointer"
            style={
              pickerColor
                ? { backgroundColor: pickerColor }
                : { background: generateColorWheel() }
            }
            onClick={() => {
              if (pickerColor) handleChangeColor(pickerColor);
            }}
          />
          <input
            id="color-picker"
            type="color"
            value={pickerColor}
            onChange={(e) => handleChangePickerColor(e.target.value)}
            className="w-0 h-0 opacity-0"
          />
        </div>

        <hr className="w-0.5 h-10 bg-gray-200 dark:bg-gray-700 border-none" />

        <div className="w-full h-full py-3.5 pr-3.5 overflow-x-auto overflow-y-hidden flex items-center gap-3.5">
          {Object.values(Colors).map((color, index) => (
            <button
              key={index}
              className="min-w-10 aspect-square rounded-md border-[1px] border-gray-200 dark:border-gray-700 hover:cursor-pointer"
              style={{ backgroundColor: color }}
              onClick={() => handleChangeColor(color)}
            />
          ))}
        </div>
      </div>

      <button
        onClick={handleShowColorPicker}
        className="w-10 h-10 rounded-md shadow flex justify-center items-center hover:bg-gray-200 transition-all duration-200 hover:cursor-pointer"
        style={{ backgroundColor: color }}
      >
        {showColorPicker ? (
          <img
            src={CloseIcon}
            alt="close"
            className="w-full h-full invert p-2.5 opacity-0 hover:opacity-100 transition-opacity duration-200"
          />
        ) : (
          <img
            src={EditIcon}
            alt="pen"
            className="w-full h-full invert p-2.5 opacity-0 hover:opacity-100 transition-opacity duration-200"
          />
        )}
      </button>
    </div>
  );
};
