import { Author } from "./Author";
import { Pixel } from "./Pixel";

export interface IPixelBoard {
  _id: string;
  title: string;
  status: "draft" | "active" | "completed";
  creationDate: string;
  endDate: string;
  width: number;
  height: number;
  author: Author;
  allowOverwriting: boolean;
  participationDelay: number;
  pixels: Pixel[];
  contributions: number;
}
