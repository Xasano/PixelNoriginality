export interface PixelBoardFormData {
  title: string;
  status: "draft" | "active" | "completed";
  endDate: string;
  width: number;
  height: number;
  allowOverwriting: boolean;
  participationDelay: number;
}
