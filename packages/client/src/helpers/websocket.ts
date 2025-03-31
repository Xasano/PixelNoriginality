const WS_BASE_URL = import.meta.env.VITE_WS_URL || "ws://localhost:3000";
interface UpdatePixelBoard {
  type: "pixel_update";
  update: {
    type: "update_pixel";
    pixelBoardId: string;
    x: number;
    y: number;
    color: string;
    timestamp: number;
    author: string;
  };
}

class WebSocketService {
  socket: WebSocket | null;
  isConnected: boolean;

  constructor() {
    this.socket = null;
    this.isConnected = false;

    this.connect();
  }

  connect() {
    if (
      this.socket === null ||
      (this.socket.readyState !== WebSocket.OPEN &&
        this.socket.readyState !== WebSocket.CONNECTING)
    ) {
      this.socket = new WebSocket(WS_BASE_URL);
      this.isConnected = this.socket.readyState === WebSocket.OPEN;
    }
  }

  subscribeToBoard(boardId: string) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.sendMessage(
        JSON.stringify({ type: "subscribe", pixelBoardId: boardId }),
      );
    } else {
      console.error("WebSocket is not connected.");
    }
  }

  sendMessage(message: string) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);
    } else {
      console.error("WebSocket is not connected.");
    }
  }

  close() {
    if (this.socket) {
      this.socket.close();
      this.isConnected = false;

      this.removeListeners();
    }
  }

  onMessage(callback: (message: MessageEvent) => void) {
    if (this.socket) {
      this.socket.onmessage = (event: MessageEvent) => {
        callback(event);
      };
    }
  }

  private removeListeners() {
    if (this.socket) {
      this.socket.onmessage = null;
      this.socket.onclose = null;
      this.socket.onerror = null;
    }
  }

  isUpdatePixelBoardMessage(data: unknown): data is UpdatePixelBoard {
    return (
      typeof data === "object" &&
      data !== null &&
      "type" in data &&
      (data as { type: string }).type === "pixel_update" &&
      "update" in data &&
      typeof (data as { update: unknown }).update === "object" &&
      (data as { update: { type: string } }).update.type === "update_pixel" &&
      typeof (data as { update: { pixelBoardId: unknown } }).update
        .pixelBoardId === "string" &&
      typeof (data as { update: { x: unknown } }).update.x === "number" &&
      typeof (data as { update: { y: unknown } }).update.y === "number" &&
      typeof (data as { update: { color: unknown } }).update.color ===
        "string" &&
      typeof (data as { update: { timestamp: unknown } }).update.timestamp ===
        "number" &&
      typeof (data as { update: { author: unknown } }).update.author ===
        "string"
    );
  }
}

export const websocketService = new WebSocketService();
