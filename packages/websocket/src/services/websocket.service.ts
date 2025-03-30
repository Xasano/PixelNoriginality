import type { WebSocketMessage, PixelUpdate, WebSocketData } from "../types";
import Bun from "bun";

// Define types for Bun WebSocket server and connections
interface BunServer {
  upgrade: (req: Request, options: { data: WebSocketData }) => boolean;
  publish: (channel: string, message: string) => void;
  stop: () => void;
}

interface BunWebSocket {
  data: WebSocketData;
  send: (message: string) => void;
  subscribe: (channel: string) => void;
  unsubscribe: (channel: string) => void;
}

export class WebSocketService {
  private server: BunServer | null = null;

  constructor() {}

  // Initialiser le serveur WebSocket
  initServer(port: number = 3000) {
    this.server = Bun.serve({
      fetch: this.handleUpgrade.bind(this),
      websocket: {
        open: this.handleOpen.bind(this),
        message: this.handleMessage.bind(this),
        close: this.handleClose.bind(this),
      },
      port,
    }) as BunServer;

    return this.server;
  }

  // Gestion de la connexion initiale
  private handleUpgrade(req: Request, server: BunServer) {
    const url = new URL(req.url);
    const username = url.searchParams.get("username") || "Anonymous";

    if (server.upgrade(req, { data: { username } })) {
      return;
    }

    return new Response("Erreur lors de l'upgrade", { status: 500 });
  }

  // Gestion de l'ouverture de connexion
  private handleOpen(ws: BunWebSocket) {
    const data = ws.data as WebSocketData;
    const username = data.username || "Anonymous";
    console.log(`Nouvel utilisateur connecté : ${username}`);
  }

  // Gestion des messages
  private async handleMessage(ws: BunWebSocket, message: string) {
    try {
      const parsedMessage = JSON.parse(message.toString()) as WebSocketMessage;

      switch (parsedMessage.type) {
        case "subscribe":
          return this.handleSubscribe(ws, parsedMessage);

        case "update_pixel":
          return this.handlePixelUpdate(ws, parsedMessage);

        case "unsubscribe":
          return this.handleUnsubscribe(ws, parsedMessage);

        default:
          throw new Error("Type de message inconnu");
      }
    } catch (error) {
      this.handleError(ws, error);
    }
  }

  // Désabonnement d'un pixel board
  private handleUnsubscribe(ws: BunWebSocket, message: { pixelBoardId: string }) {
    if (!message.pixelBoardId) {
      throw new Error("pixelBoardId est requis pour se désabonner");
    }

    ws.unsubscribe(`pixelboard:${message.pixelBoardId}`);
    console.log(
      `Client désabonné du canal: pixelboard:${message.pixelBoardId}`
    );

    ws.send(
      JSON.stringify({
        type: "unsubscribe_success",
        pixelBoardId: message.pixelBoardId,
      })
    );
  }

  // Abonnement à un pixel board
  private handleSubscribe(ws: BunWebSocket, message: { pixelBoardId: string }) {
    if (!message.pixelBoardId) {
      throw new Error("pixelBoardId est requis pour s'abonner");
    }

    ws.subscribe(`pixelboard:${message.pixelBoardId}`);
    console.log(`Client abonné au canal: pixelboard:${message.pixelBoardId}`);

    ws.send(
      JSON.stringify({
        type: "subscribe_success",
        pixelBoardId: message.pixelBoardId,
      })
    );
  }

  // Mise à jour d'un pixel
  private async handlePixelUpdate(ws: BunWebSocket, pixelUpdate: PixelUpdate) {
    // Validation
    if (!this.validatePixelUpdate(pixelUpdate)) {
      throw new Error("Données de pixel invalides");
    }

    // Préparer les données
    const updateData = {
      ...pixelUpdate,
      timestamp: Date.now(),
      author: ws.data.username || "Anonymous",
    };

    // Broadcast aux clients abonnés
    if (!this.server) {
      throw new Error("Server not initialized");
    }
    
    this.server.publish(
      `pixelboard:${pixelUpdate.pixelBoardId}`,
      JSON.stringify({
        type: "pixel_update",
        update: updateData,
      })
    );

    // Réponse de succès
    ws.send(
      JSON.stringify({
        type: "update_success",
      })
    );
  }

  // Validation des données de mise à jour de pixel
  private validatePixelUpdate(update: PixelUpdate): boolean {
    return !!(
      update.pixelBoardId &&
      update.x !== undefined &&
      update.y !== undefined &&
      update.color
    );
  }

  // Gestion des erreurs
  private handleError(ws: BunWebSocket, error: unknown) {
    console.error("Erreur de traitement du message:", error);
    ws.send(
      JSON.stringify({
        type: "error",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      })
    );
  }

  // Gestion de la fermeture de connexion
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private handleClose(ws: BunWebSocket) {
    console.log("Connexion WebSocket fermée");
  }

  // Arrêt du serveur
  stop() {
    if (this.server) {
      this.server.stop();
    }
  }
}

export default new WebSocketService();