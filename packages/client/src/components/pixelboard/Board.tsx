import { useCallback, useEffect, useRef, useState } from "react";
import { ExportButton } from "./ExportButton";
import { useAuth } from "@hooks/useAuth";
import { Pixel } from "@interfaces/Pixel";
import { apiService, isApiError } from "@/helpers/request";
import { ReplayButton } from "./ReplayButton";
import { websocketService } from "@/helpers/websocket";
import { VisitorLimits } from "@/interfaces/VisitorLimits";

interface BoardProps {
  pixelboardId: string;
  isLoading: boolean;
  selectedColor: string;
  width: number;
  height: number;
  pixels?: Pixel[];
  participationTimer: number;
  addParticipationDelay: (delay?: number) => void;
  limits: VisitorLimits | null;
  setLimits: React.Dispatch<React.SetStateAction<VisitorLimits | null>>;
}

export const Board = (props: BoardProps) => {
  const { isLoading, selectedColor, pixels, pixelboardId } = props;
  const { user } = useAuth();

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const [pixelData, setPixelData] = useState<
    Record<string, { loaded: boolean; pixels: Record<string, Pixel> }>
  >({});

  const [viewport, setViewport] = useState({
    width: 0,
    height: 0,
    minX: 0,
    minY: 0,
    maxX: 0,
    maxY: 0,
  });

  // Configuration
  const pixelSize = 20;
  const visibleChunkSize = 50; // Nombre de pixel dans un chunk

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasDragged = useRef<boolean>(false);
  const dragStartedWithShift = useRef<boolean>(false);
  const lastMousePosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const previousDimensionsRef = useRef({ width: 0, height: 0 });
  const animationFrameIdRef = useRef<number | null>(null);
  const viewportRef = useRef(viewport); // Référence de viewport pour éviter les dépendances circulaires
  const isResizingRef = useRef<boolean>(false);
  const scaleRef = useRef<number>(scale);
  const offsetRef = useRef(offset);
  const isFirstRenderRef = useRef(true);
  const pixelsProcessedRef = useRef(false);

  // Nouveaux états pour le replay
  const [isReplaying, setIsReplaying] = useState(false);
  const [currentReplayIndex, setCurrentReplayIndex] = useState(0);
  const [replaySpeed, setReplaySpeed] = useState(100);
  const replayPixelsRef = useRef<Pixel[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);

  // PARTIE MOBILE
  // Pour le zoom à deux doigts
  const lastPinchDistance = useRef<number>(0);
  const lastPinchScale = useRef<number>(1);
  const pinchCenter = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    websocketService.connect();
    setTimeout(() => {
      websocketService.subscribeToBoard(pixelboardId);

      websocketService.onMessage((message) => {
        const data = JSON.parse(message.data);
        console.log(data, websocketService.isUpdatePixelBoardMessage(data));
        if (websocketService.isUpdatePixelBoardMessage(data)) {
          // Add new pixel to board
          const pixel: Pixel = {
            x: data.update.x,
            y: data.update.y,
            color: data.update.color,
            placedBy: data.update.author,
            placedAt: data.update.timestamp.toString(),
          };
          console.log("WS NEW PIXEL", pixel);
          setPixelData((prevData) => {
            const newData = { ...prevData };

            // Déterminer dans quel chunk se trouve ce pixel
            const chunkX = Math.floor(pixel.x / visibleChunkSize);
            const chunkY = Math.floor(pixel.y / visibleChunkSize);
            const chunkKey = `${chunkX},${chunkY}`;

            // Position relative dans le chunk
            const relativeX = pixel.x - chunkX * visibleChunkSize;
            const relativeY = pixel.y - chunkY * visibleChunkSize;
            const pixelKey = `${relativeX},${relativeY}`;

            if (!newData[chunkKey]) {
              newData[chunkKey] = { loaded: true, pixels: {} };
            }

            if (!newData[chunkKey].pixels) {
              newData[chunkKey].pixels = {};
            }

            newData[chunkKey].pixels[pixelKey] = pixel;

            return newData;
          });
        }
      });
    }, 100);

    return () => {
      websocketService.close();
    };
  }, []);

  // MAJ des références
  useEffect(() => {
    viewportRef.current = viewport;
  }, [viewport]);

  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);

  const handleDrawPixel = async (e: React.MouseEvent) => {
    if (
      !canvasRef.current ||
      isLoading ||
      props.participationTimer > 0 ||
      isReplaying ||
      (props.limits && props.limits?.pixelsRemaining === 0)
    )
      return;

    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Conversion en coordonnées de pixel
    const pixelX = Math.floor(
      (mouseX - offsetRef.current.x) / (pixelSize * scaleRef.current),
    );
    const pixelY = Math.floor(
      (mouseY - offsetRef.current.y) / (pixelSize * scaleRef.current),
    );

    // Vérifier si le pixel est dans les limites du tableau
    if (
      pixelX < 0 ||
      pixelX >= props.width ||
      pixelY < 0 ||
      pixelY >= props.height
    ) {
      console.log(
        `Pixel (${pixelX}, ${pixelY}) en dehors des limites du tableau`,
      );
      return;
    }

    // Create timestamp BEFORE API call to ensure consistency
    const currentTimestamp = new Date().toISOString();

    try {
      await apiService.post(
        `/pixel-boards/${pixelboardId}/pixels`,
        JSON.stringify({
          x: pixelX,
          y: pixelY,
          color: selectedColor,
        }),
      );

      websocketService.sendMessage(
        JSON.stringify({
          type: "update_pixel",
          pixelBoardId: pixelboardId,
          x: pixelX,
          y: pixelY,
          color: selectedColor,
        }),
      );
    } catch (err) {
      console.error(err);
      if (isApiError(err) && err.description.includes("Vous devez attendre")) {
        const regex = /(\d+)\s*seconde[s]?/i;
        const match = err.description.match(regex);

        if (match && match[1]) {
          props.addParticipationDelay(parseInt(match[1], 10));
        }
      }
      return;
    }

    props.addParticipationDelay();

    // Déterminer dans quel chunk se trouve ce pixel
    const chunkX = Math.floor(pixelX / visibleChunkSize);
    const chunkY = Math.floor(pixelY / visibleChunkSize);
    const chunkKey = `${chunkX},${chunkY}`;

    // Position relative dans le chunk
    const relativeX = pixelX - chunkX * visibleChunkSize;
    const relativeY = pixelY - chunkY * visibleChunkSize;
    const pixelKey = `${relativeX},${relativeY}`;

    // Nouveau pixel avec timestamp cohérent
    const newPixel = {
      color: selectedColor,
      x: pixelX,
      y: pixelY,
      placedBy: user?._id ? user._id : "anonymous user",
      placedAt: currentTimestamp,
    };

    // Mise à jour du pixel
    setPixelData((prevData) => {
      const newData = { ...prevData };

      if (!newData[chunkKey]) {
        newData[chunkKey] = { loaded: true, pixels: {} };
      }

      // S'assurer que l'objet pixels existe et n'est pas undefined
      if (!newData[chunkKey].pixels) {
        newData[chunkKey].pixels = {};
      }

      // Mise à jour du pixel
      newData[chunkKey].pixels[pixelKey] = newPixel;

      console.log(
        `Pixel set at (${pixelX}, ${pixelY}) with color ${selectedColor}`,
      );

      return newData;
    });

    // Add the new pixel to the replay pixels array if not replaying
    if (!isReplaying) {
      // Add the new pixel to the replay array and re-sort
      const updatedReplayPixels = [...replayPixelsRef.current, newPixel].sort(
        (a, b) => {
          const dateA = new Date(a.placedAt || 0).getTime();
          const dateB = new Date(b.placedAt || 0).getTime();
          return dateA - dateB;
        },
      );

      replayPixelsRef.current = updatedReplayPixels;
    }
  };

  // Gestion des événements de redimensionnement, focus et visibilité
  useEffect(() => {
    if (containerRef.current && canvasRef.current) {
      const resizeCanvas = () => {
        const canvas = canvasRef.current;
        const container = containerRef.current;

        if (!canvas || !container) return;

        // Forcer une taille explicite sur le canvas
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;

        const width = container.clientWidth;
        const height = container.clientHeight;

        previousDimensionsRef.current = { width, height };

        // Calculer les valeurs du viewport
        const scaledPixelSize = pixelSize * scaleRef.current;
        const minX = Math.floor(-offsetRef.current.x / scaledPixelSize);
        const minY = Math.floor(-offsetRef.current.y / scaledPixelSize);
        const maxX = Math.ceil((width - offsetRef.current.x) / scaledPixelSize);
        const maxY = Math.ceil(
          (height - offsetRef.current.y) / scaledPixelSize,
        );

        setViewport({ width, height, minX, minY, maxX, maxY });

        // Force immediate redraw
        drawCanvas();
      };

      // Effectuer le redimensionnement initial
      resizeCanvas();

      // Centrer le board sur le premier rendu si nécessaire
      const isFirstRender = offset.x === 0 && offset.y === 0;
      if (isFirstRender && !isLoading) {
        setOffset({
          x: (viewport.width - props.width * pixelSize * scale) / 2,
          y: (viewport.height - props.height * pixelSize * scale) / 2,
        });
      }

      // Configurer ResizeObserver
      const resizeObserver = new ResizeObserver(() => {
        if (!isResizingRef.current) {
          isResizingRef.current = true;
          window.requestAnimationFrame(() => {
            resizeCanvas();
            isResizingRef.current = false;
          });
        }
      });

      resizeObserver.observe(containerRef.current);

      // Gérer le redimensionnement de la fenêtre et les événements de focus
      const handleResize = () => resizeCanvas();
      const handleFocus = () => {
        if (canvasRef.current) {
          drawCanvas();
        }
      };

      const handleVisibilityChange = () => {
        if (document.visibilityState === "visible") {
          setTimeout(() => {
            forceRedraw();
          }, 100); // Léger délai pour s'assurer que tout est prêt
        }
      };

      window.addEventListener("resize", handleResize);
      window.addEventListener("focus", handleFocus);
      document.addEventListener("visibilitychange", handleVisibilityChange);

      // Redessiner périodiquement pendant quelques secondes après le focus
      const handleVisibilityOrFocus = () => {
        if (document.visibilityState === "visible" || document.hasFocus()) {
          // Redessiner immédiatement
          forceRedraw();

          // Puis redessiner toutes les 100ms pendant 2 secondes
          let count = 0;
          const interval = setInterval(() => {
            forceRedraw();
            count++;
            if (count >= 20) clearInterval(interval);
          }, 100);

          return () => clearInterval(interval);
        }
      };

      window.addEventListener("focus", handleVisibilityOrFocus);
      document.addEventListener("visibilitychange", handleVisibilityOrFocus);

      return () => {
        if (resizeObserver) {
          resizeObserver.disconnect();
        }
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("focus", handleFocus);
        window.removeEventListener("focus", handleVisibilityOrFocus);
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange,
        );
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityOrFocus,
        );

        if (animationFrameIdRef.current) {
          cancelAnimationFrame(animationFrameIdRef.current);
        }
      };
    }
  }, [
    isLoading,
    props.width,
    props.height,
    pixelSize,
    scale,
    offset,
    viewport.width,
    viewport.height,
  ]);

  // Centre le board lorsque le chargement est fini
  useEffect(() => {
    console.log("isReplaying", isReplaying);
    if (
      !isLoading &&
      isFirstRenderRef.current &&
      viewport.width > 0 &&
      viewport.height > 0
    ) {
      isFirstRenderRef.current = false;
      setOffset({
        x: (viewport.width - props.width * pixelSize * scale) / 2,
        y: (viewport.height - props.height * pixelSize * scale) / 2,
      });
    }

    // Centre et dézoom le board lorsqu'un replay est lancé
    if (isReplaying && containerRef.current) {
      const minScale = calculateMinimumScale();
      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      const newOffsetX =
        (containerWidth - props.width * pixelSize * minScale) / 2;
      const newOffsetY =
        (containerHeight - props.height * pixelSize * minScale) / 2;

      setScale(minScale);
      setOffset({ x: newOffsetX, y: newOffsetY });
      return;
    }
  }, [
    isLoading,
    props.width,
    props.height,
    pixelSize,
    scale,
    viewport.width,
    viewport.height,
    isReplaying,
  ]);

  // Met à jour les pixels
  useEffect(() => {
    if (pixels && pixels.length > 0) {
      // Reload all chunks with the new pixels
      setPixelData((prevData) => {
        const newData = { ...prevData };

        Object.keys(newData).forEach((chunkKey) => {
          const [chunkXStr, chunkYStr] = chunkKey.split(",");
          const chunkX = parseInt(chunkXStr);
          const chunkY = parseInt(chunkYStr);

          pixels.forEach((pixel) => {
            const pixelChunkX = Math.floor(pixel.x / visibleChunkSize);
            const pixelChunkY = Math.floor(pixel.y / visibleChunkSize);

            if (pixelChunkX === chunkX && pixelChunkY === chunkY) {
              const relativeX = pixel.x - pixelChunkX * visibleChunkSize;
              const relativeY = pixel.y - pixelChunkY * visibleChunkSize;
              const pixelKey = `${relativeX},${relativeY}`;

              if (!newData[chunkKey].pixels) {
                newData[chunkKey].pixels = {};
              }

              newData[chunkKey].pixels[pixelKey] = {
                color: pixel.color,
                x: pixel.x,
                y: pixel.y,
                placedBy: pixel.placedBy,
                placedAt: pixel.placedAt,
              };
            }
          });
        });

        return newData;
      });

      // Force redraw after pixels update
      forceRedraw();
    }
  }, [pixels]);

  // Charge les pixels visibles
  useEffect(() => {
    const loadVisiblePixels = () => {
      // Visible chunks
      const minChunkX = Math.floor(viewportRef.current.minX / visibleChunkSize);
      const minChunkY = Math.floor(viewportRef.current.minY / visibleChunkSize);
      const maxChunkX = Math.ceil(viewportRef.current.maxX / visibleChunkSize);
      const maxChunkY = Math.ceil(viewportRef.current.maxY / visibleChunkSize);

      const maxChunksToLoad = 100;
      let chunksToLoadCount = 0;

      const newPixels = pixelData;
      let updated = false;

      for (
        let chunkY = Math.max(-50, minChunkY);
        chunkY <= Math.min(50, maxChunkY);
        chunkY++
      ) {
        for (
          let chunkX = Math.max(-50, minChunkX);
          chunkX <= Math.min(50, maxChunkX);
          chunkX++
        ) {
          if (chunksToLoadCount >= maxChunksToLoad) {
            console.warn("Limite de chargement de chunks atteinte");
            break;
          }

          const chunkKey = `${chunkX},${chunkY}`;

          // Crée un nouveau chunk s'il n'existe pas
          if (!newPixels[chunkKey]) {
            newPixels[chunkKey] = {
              loaded: true,
              pixels: {},
            };

            // Ajoute les pixels existants dans ce chunk
            if (pixels && pixels.length > 0) {
              pixels.forEach((pixel) => {
                const pixelChunkX = Math.floor(pixel.x / visibleChunkSize);
                const pixelChunkY = Math.floor(pixel.y / visibleChunkSize);

                if (pixelChunkX === chunkX && pixelChunkY === chunkY) {
                  const relativeX = pixel.x - pixelChunkX * visibleChunkSize;
                  const relativeY = pixel.y - pixelChunkY * visibleChunkSize;
                  const pixelKey = `${relativeX},${relativeY}`;

                  newPixels[chunkKey].pixels[pixelKey] = {
                    color: pixel.color,
                    x: pixel.x,
                    y: pixel.y,
                    placedBy: pixel.placedBy,
                    placedAt: pixel.placedAt,
                  };
                }
              });
            }

            updated = true;
            chunksToLoadCount++;
          }
        }

        if (chunksToLoadCount >= maxChunksToLoad) {
          break;
        }
      }

      if (updated) {
        setPixelData(newPixels);
        // Force a redraw immediately after updating pixel data
        setTimeout(() => forceRedraw(), 0);
      }
    };

    if (viewport.width > 0 && viewport.height > 0) {
      loadVisiblePixels();
    }
  }, [viewport]);

  // Redessine le canvas quand les pixels changent
  useEffect(() => {
    const requestRedraw = () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }

      animationFrameIdRef.current = requestAnimationFrame(() => {
        drawCanvas();
        animationFrameIdRef.current = null;
      });
    };

    requestRedraw();
  }, [pixelData]);

  // Réinitialiser le flag lorsque les pixels changent
  useEffect(() => {
    if (pixels && pixels.length > 0) {
      pixelsProcessedRef.current = false;
    }
  }, [pixels]);

  const calculateMinimumScale = (): number => {
    if (!containerRef.current) return 0.01;

    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Calcul du zoom minimal pour voir tout le board
    const scaleX = containerWidth / (props.width * pixelSize);
    const scaleY = containerHeight / (props.height * pixelSize);

    return Math.min(scaleX, scaleY) * 0.95;
  };

  // Gestion du zoom
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const wheelHandler = (e: WheelEvent) => {
      e.preventDefault();

      // Calculer le zoom minimal nécessaire pour voir tout le board
      const minScale = calculateMinimumScale();

      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;

      const wasAtMinScale = Math.abs(scale - minScale) < 0.001;

      const newScale = Math.max(minScale, Math.min(10, scale * zoomFactor));

      // Check si on est au niveau du zoom minimal après la mise à jour
      const isAtMinScale = Math.abs(newScale - minScale) < 0.001;

      if (newScale === scale) return;

      // Si zoom minimal, centrer automatiquement le board
      if (isAtMinScale && !wasAtMinScale) {
        // Calcule de l'offset nécessaire pour centrer le board
        if (containerRef.current) {
          const container = containerRef.current;
          const containerWidth = container.clientWidth;
          const containerHeight = container.clientHeight;

          const newOffsetX =
            (containerWidth - props.width * pixelSize * newScale) / 2;
          const newOffsetY =
            (containerHeight - props.height * pixelSize * newScale) / 2;

          setScale(newScale);
          setOffset({ x: newOffsetX, y: newOffsetY });
          return;
        }
      }

      // Zoom centré sur la position du curseur
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const newOffsetX = mouseX - (mouseX - offset.x) * (newScale / scale);
      const newOffsetY = mouseY - (mouseY - offset.y) * (newScale / scale);

      setScale(newScale);
      setOffset({ x: newOffsetX, y: newOffsetY });
    };

    canvas.addEventListener("wheel", wheelHandler, { passive: false });

    return () => {
      canvas.removeEventListener("wheel", wheelHandler);
    };
  }, [scale, offset, props.width, props.height]);

  // Memoize la fonction pour éviter les recréations à chaque rendu
  const drawCanvas = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // S'assurer que le canvas a une taille définie
    if (canvas.width === 0 || canvas.height === 0) {
      if (containerRef.current) {
        canvas.width = containerRef.current.clientWidth;
        canvas.height = containerRef.current.clientHeight;
      }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const bgColor = "#ffffff";
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const scaledPixelSize = pixelSize * scaleRef.current;

    // Déssine les limites du board
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#dddddd";
    const boardLeft = offsetRef.current.x;
    const boardTop = offsetRef.current.y;
    const boardWidth = props.width * scaledPixelSize;
    const boardHeight = props.height * scaledPixelSize;
    ctx.strokeRect(boardLeft, boardTop, boardWidth, boardHeight);

    // Dessine la grille
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";

    const minX = Math.max(0, viewportRef.current.minX);
    const minY = Math.max(0, viewportRef.current.minY);
    const maxX = Math.min(props.width - 1, viewportRef.current.maxX);
    const maxY = Math.min(props.height - 1, viewportRef.current.maxY);

    for (const chunkKey in pixelData) {
      const chunk = pixelData[chunkKey];
      if (!chunk || !chunk.loaded || !chunk.pixels) continue;

      for (const pixelKey in chunk.pixels) {
        const pixel = chunk.pixels[pixelKey];
        if (!pixel || !pixel.color) continue;

        // Dessine le pixel uniquement s'il est visible
        if (
          pixel.x >= minX &&
          pixel.x <= maxX &&
          pixel.y >= minY &&
          pixel.y <= maxY
        ) {
          const posX = offsetRef.current.x + pixel.x * scaledPixelSize;
          const posY = offsetRef.current.y + pixel.y * scaledPixelSize;

          ctx.fillStyle = pixel.color;
          ctx.fillRect(posX, posY, scaledPixelSize, scaledPixelSize);
        }
      }
    }

    // Dessiner la grille si le zoom est suffisamment élevé
    if (scaleRef.current > 0.08) {
      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          const posX = offsetRef.current.x + x * scaledPixelSize;
          const posY = offsetRef.current.y + y * scaledPixelSize;
          ctx.strokeRect(posX, posY, scaledPixelSize, scaledPixelSize);
        }
      }
    }
  }, [pixelData, props.width, props.height]);

  // Force redraw function
  const forceRedraw = useCallback(() => {
    if (canvasRef.current && containerRef.current) {
      // Recalculer explicitement les dimensions
      canvasRef.current.width = containerRef.current.clientWidth;
      canvasRef.current.height = containerRef.current.clientHeight;

      // Forcer le redessinage immédiat
      drawCanvas();
    }
  }, [drawCanvas]);

  // Fonction pour effacer complètement le canvas
  const clearCanvas = useCallback(() => {
    // Créer un nouvel objet pixelData vide mais conserver la structure
    setPixelData((prevData) => {
      const newData = { ...prevData };

      // Vider tous les pixels de tous les chunks
      Object.keys(newData).forEach((chunkKey) => {
        if (newData[chunkKey] && newData[chunkKey].pixels) {
          newData[chunkKey].pixels = {};
        }
      });

      return newData;
    });
  }, []);

  const addReplayPixel = useCallback((pixel: Pixel) => {
    if (!pixel) return;

    // Déterminer dans quel chunk se trouve ce pixel
    const chunkX = Math.floor(pixel.x / visibleChunkSize);
    const chunkY = Math.floor(pixel.y / visibleChunkSize);
    const chunkKey = `${chunkX},${chunkY}`;

    // Position relative dans le chunk
    const relativeX = pixel.x - chunkX * visibleChunkSize;
    const relativeY = pixel.y - chunkY * visibleChunkSize;
    const pixelKey = `${relativeX},${relativeY}`;

    // Mise à jour du pixel
    setPixelData((prevData) => {
      const newData = { ...prevData };

      if (!newData[chunkKey]) {
        newData[chunkKey] = { loaded: true, pixels: {} };
      }

      if (!newData[chunkKey].pixels) {
        newData[chunkKey].pixels = {};
      }

      newData[chunkKey].pixels[pixelKey] = {
        color: pixel.color,
        x: pixel.x,
        y: pixel.y,
        placedBy: pixel.placedBy,
        placedAt: pixel.placedAt,
      };

      return newData;
    });
  }, []);

  // Fonction pour préparer les pixels du replay sans utiliser setState
  const prepareReplayPixels = useCallback(() => {
    const allPixels: Pixel[] = [];

    // Récupérer les pixels des chunks
    for (const chunkKey in pixelData) {
      const chunk = pixelData[chunkKey];
      if (!chunk?.loaded || !chunk.pixels) continue;

      for (const pixelKey in chunk.pixels) {
        const pixel = chunk.pixels[pixelKey];
        if (pixel && pixel.placedAt) {
          // Create a new object to avoid reference issues
          allPixels.push({ ...pixel });
        }
      }
    }

    // Ajouter les pixels du serveur s'ils ne sont pas déjà dans la liste
    if (pixels && pixels.length > 0) {
      pixels.forEach((pixel) => {
        const exists = allPixels.some(
          (p) =>
            p.x === pixel.x && p.y === pixel.y && p.placedAt === pixel.placedAt,
        );

        if (!exists) {
          // Create a new object to avoid reference issues
          allPixels.push({ ...pixel });
        }
      });
    }

    // Ensure all pixels have valid timestamps
    allPixels.forEach((pixel) => {
      if (!pixel.placedAt) {
        pixel.placedAt = new Date().toISOString();
      }
    });

    // Trier par date de placement
    const sortedPixels = allPixels.sort((a, b) => {
      const dateA = new Date(a.placedAt || 0).getTime();
      const dateB = new Date(b.placedAt || 0).getTime();
      return dateA - dateB;
    });

    replayPixelsRef.current = sortedPixels;
    console.log(`${sortedPixels.length} pixels préparés pour le replay`);
  }, [pixelData, pixels]);

  const animateReplay = useCallback(
    (timestamp: number) => {
      if (!isReplaying) return;

      // Calculer le temps écoulé depuis la dernière frame
      const elapsed = timestamp - lastFrameTimeRef.current;

      // Si suffisamment de temps s'est écoulé (selon la vitesse choisie)
      if (elapsed >= replaySpeed) {
        lastFrameTimeRef.current = timestamp;

        // Ajouter le pixel courant si possible
        if (currentReplayIndex < replayPixelsRef.current.length) {
          addReplayPixel(replayPixelsRef.current[currentReplayIndex]);
          setCurrentReplayIndex((prev) => prev + 1);
        } else {
          // Fin du replay
          setIsReplaying(false);
          setCurrentReplayIndex(0);
          console.log("Replay terminé");
          return;
        }
      }

      // Continuer l'animation
      animationFrameRef.current = requestAnimationFrame(animateReplay);
    },
    [isReplaying, currentReplayIndex, replaySpeed, addReplayPixel],
  );

  // Fonction pour démarrer le replay
  const startReplay = useCallback(() => {
    // Préparer les pixels
    prepareReplayPixels();

    // Vérifier s'il y a des pixels à rejouer
    if (replayPixelsRef.current.length === 0) {
      console.warn("Aucun pixel à rejouer");
      return;
    }

    console.log(
      `Démarrage du replay avec ${replayPixelsRef.current.length} pixels`,
    );

    // Log some sample timestamps for debugging
    if (replayPixelsRef.current.length > 0) {
      const samples = Math.min(5, replayPixelsRef.current.length);
      console.log("Sample timestamps:");
      for (let i = 0; i < samples; i++) {
        console.log(`Pixel ${i}: ${replayPixelsRef.current[i].placedAt}`);
      }
    }

    // Nettoyer le canvas
    clearCanvas();

    // Initialiser le replay
    setCurrentReplayIndex(0);
    setIsReplaying(true);
  }, [prepareReplayPixels, clearCanvas]);

  useEffect(() => {
    if (isReplaying) {
      // Démarrer l'animation
      lastFrameTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(animateReplay);
    } else {
      // Arrêter l'animation
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isReplaying, animateReplay]);

  // Mettre à jour la collection de pixels pour le replay quand les données changent
  useEffect(() => {
    if (!isReplaying) {
      prepareReplayPixels();
    }
  }, [pixelData, pixels, isReplaying, prepareReplayPixels]);

  // Fonction pour restaurer tous les pixels après un arrêt du replay
  const restoreAllPixels = useCallback(() => {
    if (!pixels || pixels.length === 0) return;

    setPixelData((prevData) => {
      const newData = { ...prevData };

      // Vider tous les pixels existants
      Object.keys(newData).forEach((chunkKey) => {
        if (newData[chunkKey]) {
          newData[chunkKey].pixels = {};
        }
      });

      // Ajouter tous les pixels
      pixels.forEach((pixel) => {
        const pixelChunkX = Math.floor(pixel.x / visibleChunkSize);
        const pixelChunkY = Math.floor(pixel.y / visibleChunkSize);
        const chunkKey = `${pixelChunkX},${pixelChunkY}`;

        if (!newData[chunkKey]) {
          newData[chunkKey] = { loaded: true, pixels: {} };
        }

        if (!newData[chunkKey].pixels) {
          newData[chunkKey].pixels = {};
        }

        const relativeX = pixel.x - pixelChunkX * visibleChunkSize;
        const relativeY = pixel.y - pixelChunkY * visibleChunkSize;
        const pixelKey = `${relativeX},${relativeY}`;

        newData[chunkKey].pixels[pixelKey] = {
          color: pixel.color,
          x: pixel.x,
          y: pixel.y,
          placedBy: pixel.placedBy,
          placedAt: pixel.placedAt,
        };
      });

      return newData;
    });
  }, [pixels]);

  // Fonction pour arrêter le replay
  const stopReplay = useCallback(() => {
    setIsReplaying(false);

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Restaurer les pixels
    restoreAllPixels();
  }, [restoreAllPixels]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      // Clic gauche uniquement
      // Enregistrer la position initiale
      lastMousePosition.current = { x: e.clientX, y: e.clientY };

      // Réinitialiser le flag de déplacement
      hasDragged.current = false;

      // Déterminer si nous commençons un déplacement (uniquement avec Shift)
      const shouldStartPan = e.shiftKey;
      dragStartedWithShift.current = e.shiftKey;

      if (shouldStartPan) {
        setIsDragging(true);
        setDragStart({
          x: e.clientX - offsetRef.current.x,
          y: e.clientY - offsetRef.current.y,
        });
      }

      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      // Calculer la distance parcourue
      const deltaX = Math.abs(e.clientX - lastMousePosition.current.x);
      const deltaY = Math.abs(e.clientY - lastMousePosition.current.y);

      if (deltaX > 3 || deltaY > 3) {
        hasDragged.current = true;
      }

      // Mettre à jour la position
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }

    // Mettre à jour la dernière position connue
    lastMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    // Clic gauche uniquement
    if (e.button === 0) {
      if (isDragging) {
        setIsDragging(false);
      }
      // Si c'est un simple clic (mode dessin par défaut)
      else if (!hasDragged.current) {
        handleDrawPixel(e);
      }

      // Réinitialiser les flags
      hasDragged.current = false;
      dragStartedWithShift.current = false;
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
    }

    // Réinitialiser les flags
    hasDragged.current = false;
    dragStartedWithShift.current = false;
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  // Gestionnaire pour toucher l'écran
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      // Enregistrer la position initiale
      lastMousePosition.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };

      // Réinitialiser le flag de déplacement
      hasDragged.current = false;

      // Par défaut, considérer que c'est un déplacement sur mobile (équivalent à Shift+clic)
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - offsetRef.current.x,
        y: e.touches[0].clientY - offsetRef.current.y,
      });
    } else if (e.touches.length === 2) {
      // Zoom à deux doigts - enregistrer la distance initiale
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const initialDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY,
      );

      // Stocker la distance initiale et le scale actuel
      lastPinchDistance.current = initialDistance;
      lastPinchScale.current = scale;

      // Le centre du pinch
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;
      pinchCenter.current = { x: centerX, y: centerY };
    }
  };

  // Gestionnaire pour le déplacement du doigt
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      // Déplacement avec un doigt
      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;

      // Calculer la distance parcourue
      const deltaX = Math.abs(touchX - lastMousePosition.current.x);
      const deltaY = Math.abs(touchY - lastMousePosition.current.y);

      if (deltaX > 3 || deltaY > 3) {
        hasDragged.current = true;
      }

      // Mettre à jour la position
      setOffset({
        x: touchX - dragStart.x,
        y: touchY - dragStart.y,
      });

      // Mettre à jour la dernière position connue
      lastMousePosition.current = { x: touchX, y: touchY };
    } else if (e.touches.length === 2) {
      // Zoom avec deux doigts
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];

      // Calculer la nouvelle distance
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY,
      );

      // Le ratio de zoom
      const pinchRatio = currentDistance / lastPinchDistance.current;

      // Calculer le nouveau scale
      const minScale = calculateMinimumScale();
      const newScale = Math.max(
        minScale,
        Math.min(10, lastPinchScale.current * pinchRatio),
      );

      if (newScale !== scale) {
        // Le centre du pinch
        const centerX = (touch1.clientX + touch2.clientX) / 2;
        const centerY = (touch1.clientY + touch2.clientY) / 2;

        // Zoom centré sur la position des doigts
        const newOffsetX = centerX - (centerX - offset.x) * (newScale / scale);
        const newOffsetY = centerY - (centerY - offset.y) * (newScale / scale);

        setScale(newScale);
        setOffset({ x: newOffsetX, y: newOffsetY });
      }
    }
  };

  // Gestionnaire pour lever le doigt
  const handleTouchEnd = (e: React.TouchEvent) => {
    // Si un seul doigt était posé et qu'il n'y a pas eu de déplacement, c'est un tap
    if (e.touches.length === 0 && !hasDragged.current) {
      // Simuler un clic à la dernière position connue
      const simulatedEvent = {
        clientX: lastMousePosition.current.x,
        clientY: lastMousePosition.current.y,
        preventDefault: () => {},
      } as React.MouseEvent;

      handleDrawPixel(simulatedEvent);
    }

    // Réinitialiser l'état de glissement
    if (e.touches.length === 0) {
      setIsDragging(false);
      hasDragged.current = false;

      // Réinitialiser les références de pinch
      lastPinchDistance.current = 0;
      lastPinchScale.current = 0;
    }
  };

  const getCursor = () => {
    if (isDragging) return "cursor-grabbing";
    return "cursor-crosshair";
  };

  const exportToImage = (type: "svg" | "png") => {
    try {
      const filename = `pixelboard-export-${new Date()
        .toISOString()
        .slice(0, 16)
        .replace(/:/g, "-")}`;

      // Collecte préalable des pixels valides pour éviter de parcourir plusieurs fois
      const validPixels = [];

      for (const chunkKey in pixelData) {
        const chunk = pixelData[chunkKey];
        if (!chunk?.loaded || !chunk.pixels) continue;

        for (const pixelKey in chunk.pixels) {
          const pixel = chunk.pixels[pixelKey];
          if (!pixel?.color) continue;

          if (
            pixel.x >= 0 &&
            pixel.x < props.width &&
            pixel.y >= 0 &&
            pixel.y < props.height
          ) {
            validPixels.push(pixel);
          }
        }
      }

      if (type === "png") {
        // Export PNG
        const exportCanvas = document.createElement("canvas");
        exportCanvas.width = props.width;
        exportCanvas.height = props.height;

        const exportCtx = exportCanvas.getContext("2d");
        if (!exportCtx) {
          throw new Error("Impossible de créer le contexte du canvas d'export");
        }

        exportCtx.fillStyle = "#ffffff";
        exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

        for (const pixel of validPixels) {
          exportCtx.fillStyle = pixel.color;
          exportCtx.fillRect(pixel.x, pixel.y, 1, 1);
        }

        const dataURL = exportCanvas.toDataURL("image/png");
        downloadFile(dataURL, `${filename}.png`);

        exportCanvas.remove();
      } else {
        // Export SVG - Générer directement le SVG sans utiliser de canvas
        let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${props.width}" height="${props.height}" viewBox="0 0 ${props.width} ${props.height}">
        <rect width="${props.width}" height="${props.height}" fill="#ffffff"/>`;

        // Créer des groupes par couleur pour réduire la taille du SVG
        const colorGroups: Record<string, string[]> = {};

        for (const pixel of validPixels) {
          if (!colorGroups[pixel.color]) {
            colorGroups[pixel.color] = [];
          }
          colorGroups[pixel.color].push(
            `<rect x="${pixel.x}" y="${pixel.y}" width="1" height="1"/>`,
          );
        }

        for (const color in colorGroups) {
          svgContent += `<g fill="${color}">${colorGroups[color].join("")}</g>`;
        }

        svgContent += "</svg>";

        const blob = new Blob([svgContent], { type: "image/svg+xml" });
        const dataURL = URL.createObjectURL(blob);

        downloadFile(dataURL, `${filename}.svg`);

        // Libérer l'URL d'objet
        URL.revokeObjectURL(dataURL);
      }
    } catch (error) {
      console.error(`Erreur lors de l'export en ${type.toUpperCase()}:`, error);
    }
  };

  const downloadFile = (dataURL: string, filename: string) => {
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = filename;
    link.click();
  };

  return (
    <>
      <div
        ref={containerRef}
        className={`overflow-hidden ${getCursor()} w-full h-full aspect-square bg-gray-50 dark:bg-gray-900`}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}
        <canvas
          ref={canvasRef}
          className={`w-full h-full touch-none ${isLoading ? "opacity-0" : ""}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onContextMenu={handleContextMenu}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
      </div>
      <ExportButton onExport={exportToImage} />
      <ReplayButton
        onReplay={startReplay}
        isReplaying={isReplaying}
        onSpeedChange={setReplaySpeed}
        onStopReplay={stopReplay}
      />
    </>
  );
};
