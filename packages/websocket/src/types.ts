// src/types/index.ts
export interface PixelData {
  color: string;
  author: string;
  timestamp: number;
}

export interface PixelUpdate extends PixelData {
  pixelBoardId: string;
  x: number;
  y: number;
}

export interface WebSocketData {
  username: string;
}

export interface MessageBase {
  type: string;
}

export interface SubscribeMessage extends MessageBase {
  type: 'subscribe';
  pixelBoardId: string;
}

export interface UnsubscribeMessage extends MessageBase {
    type: 'unsubscribe';
    pixelBoardId: string;
}

export interface UpdatePixelMessage extends MessageBase, PixelUpdate {
  type: 'update_pixel';
}

export interface ErrorMessage extends MessageBase {
  type: 'error';
  message: string;
}

export type WebSocketMessage = 
  | SubscribeMessage 
  | UpdatePixelMessage 
  | UnsubscribeMessage;