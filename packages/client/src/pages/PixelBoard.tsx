import { Board } from "@components/pixelboard/Board";
import { ColorPicker } from "@components/pixelboard/ColorPicker";
import { Pixel } from "@interfaces/Pixel";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { PixelBoardHeader } from "../components/pixelboard/PixelBoardHeader";
import { IPixelBoard } from "@/interfaces/PixelBoard";
import { apiService } from "@/helpers/request";
import { useAuth } from "@hooks/useAuth";
import { VisitorBanner } from "@components/pixelboard/VisitorBanner";
import { VisitorLimits } from "@/interfaces/VisitorLimits";

interface VisitorLimitsResponse {
  success: boolean;
  limits: VisitorLimits;
  message: string;
}

export const PixelBoard = () => {
  const [selectedColor, setSelectedColor] = useState("#ff0000");
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [name, setName] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [participationDelay, setParticipationDelay] = useState<number>(0);
  const [participationTimer, setParticipationTimer] = useState<number>(0);
  const [limits, setLimits] = useState<VisitorLimits | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { id } = useParams();
  const { isLoggedIn } = useAuth();
  const [visitorSessionCreated, setVisitorSessionCreated] = useState(false);

  // Création de session visiteur si nécessaire
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log("isLoggedIn", isLoggedIn);
      console.log("visitorSessionCreated", visitorSessionCreated);
      if (id && !isLoggedIn && !visitorSessionCreated) {
        apiService
          .post<{ success: boolean; visitorId: string }>("/visitors/session", {
            pixelBoardId: id,
          })
          .then((data) => {
            if (data.success) {
              setVisitorSessionCreated(true);
            }
          })
          .catch((err) => {
            console.error("Erreur de création de session visiteur:", err);
          });
      }
    }, 300);

    return () => {
      clearTimeout(timeout);
    };
  }, [id, isLoggedIn, visitorSessionCreated]);

  useEffect(() => {
    if (visitorSessionCreated) {
      apiService
        .get<VisitorLimitsResponse>("/visitors/limits")
        .then((data) => {
          if (data.success) {
            setLimits(data.limits);
          } else {
            console.error(
              "Erreur lors de la récupération des limites:",
              data.message,
            );
          }
        })
        .catch((error) => {
          console.error("Erreur lors de la récupération des limites:", error);
        });
    }
  }, [visitorSessionCreated]);

  useEffect(() => {
    apiService
      .get<IPixelBoard>(`/pixel-boards/${id}`)
      .then((data) => {
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
          limits={limits}
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
            addParticipationDelay={(delay?: number) => {
              if (limits) {
                setLimits((prev) => ({
                  ...prev!,
                  pixelsRemaining: prev!.pixelsRemaining - 1,
                  totalPixelsPlaced: prev!.totalPixelsPlaced + 1,
                }));
                setParticipationTimer(limits.boardDelay);
                return;
              }
              if (delay) setParticipationTimer(delay);
              else setParticipationTimer(participationDelay);
            }}
            limits={limits}
            setLimits={setLimits}
          />
        </div>
      </div>
      <ColorPicker onSelectedColorChange={setSelectedColor} />
      {!isLoggedIn && <VisitorBanner limits={limits} loading={isLoading} />}
    </div>
  );
};
