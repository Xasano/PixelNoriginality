import { IPixelBoard } from "./PixelBoard";

export interface PixelBoardsWithPagination {
  data: IPixelBoard[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
}
