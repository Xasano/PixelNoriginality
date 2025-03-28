export interface User {
  _id: string;
  name: string;
  avatar?: string;
  email: string;
  role: string;
  createdAt: string;
  lastConnection: string;
  prefTheme: string;
  stats: {
    pixelBoardsParticipated: number;
    pixelPainted: number;
    lastPixelTouched: string;
  };
}
