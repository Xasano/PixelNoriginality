export interface VisitorLimits {
  dailyPixelLimit: number;
  pixelsPlacedToday: number;
  pixelsRemaining: number;
  timeUntilNextPixel: number;
  timeUntilDailyReset: number;
  totalPixelsPlaced: number;
  boardDelay: number;
}
