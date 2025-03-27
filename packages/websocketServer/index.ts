import { Redis } from "ioredis";
import { randomUUID } from "crypto";

// Configuration du serveur WebSocket et Redis
const PORT = 3000;
const redisClient = new Redis({
  host: 'localhost',
  port: 6379
});

// Interface pour un pixel modifié
interface PixelUpdate {
  pixelBoardId: string;
  x: number;
  y: number;
  author: string;
  timestamp: number;
  color: string;
}

// Serveur WebSocket
const server = Bun.serve({
  fetch(req, server) {
    const url = new URL(req.url);
    // Récupérer le nom d'utilisateur depuis les paramètres de requête
    const username = url.searchParams.get('username') || 'Anonymous';
    if (
        server.upgrade(req, {
          data: { username: username },
        })
      ) {
        return;
      }
      return new Response("Erreur lors de l'upgrade", { status: 500 });
},
  // Gestionnaire des WebSocket 
  websocket: {
    // Lors de l'ouverture de la connexion
    async open(ws) {
      const data = ws.data as { username: string };
      const username = data.username || 'Anonymous';
      console.log(`Nouvel utilisateur connecté : ${username}`);
    },

    // Réception d'un message
    async message(ws, message) {
        try {
          const parsedMessage = JSON.parse(message.toString());
      
          // Vérifiez le type de message
          if (parsedMessage.type === 'subscribe') {
            // Gestion de l'abonnement à un canal spécifique
            const { pixelBoardId } = parsedMessage;
            if (!pixelBoardId) {
              throw new Error('pixelBoardId est requis pour s\'abonner');
            }
      
            // Abonner le client au canal
            ws.subscribe(`pixelboard:${pixelBoardId}`);
            console.log(`Client abonné au canal: pixelboard:${pixelBoardId}`);
            ws.send(JSON.stringify({
              type: 'subscribe_success',
              pixelBoardId: pixelBoardId
            }));
          } else if (parsedMessage.type === 'update_pixel') {
            // Gestion de la mise à jour d'un pixel
            const pixelUpdate: PixelUpdate = parsedMessage;
      
            // Validation basique
            if (!pixelUpdate.pixelBoardId || 
                pixelUpdate.x === undefined || 
                pixelUpdate.y === undefined || 
                !pixelUpdate.color) {
              throw new Error('Données de pixel invalides');
            }
      
            // Générer un ID unique pour la mise à jour
            const updateId = randomUUID();
      
            // Préparer les données à stocker
            const updateData = {
              ...pixelUpdate,
              id: updateId,
              timestamp: Date.now()
            };
      
            // Stocker dans Redis
            await Promise.all([
              // Stocker les détails du pixel
              redisClient.hset(`pixelboard:${pixelUpdate.pixelBoardId}`, 
                `pixel:${pixelUpdate.x}:${pixelUpdate.y}`, 
                JSON.stringify({
                  color: pixelUpdate.color,
                  author: pixelUpdate.author,
                  timestamp: updateData.timestamp
                })
              ),
              
              // Ajouter à la liste des mises à jour récentes
              redisClient.lpush('pixel_updates', JSON.stringify(updateData)),
              redisClient.ltrim('pixel_updates', 0, 9) // Garder les 10 dernières mises à jour
            ]);
      
            // Broadcast à tous les clients abonnés au canal
            server.publish(`pixelboard:${pixelUpdate.pixelBoardId}`, 
              JSON.stringify({
                type: 'pixel_update',
                update: updateData
              })
            );
      
            // Réponse de succès au client
            ws.send(JSON.stringify({
              type: 'update_success',
              updateId: updateId
            }));
          } else if (parsedMessage.type === 'get_pixelboard_updates') {
            // Récupérer toutes les modifications d'un pixelBoard
            const { pixelBoardId } = parsedMessage;
            if (!pixelBoardId) {
              throw new Error('pixelBoardId est requis pour récupérer les mises à jour');
            }
      
            // Récupérer toutes les modifications depuis Redis
            const updates = await redisClient.hgetall(`pixelboard:${pixelBoardId}`);
            const parsedUpdates = Object.entries(updates).map(([key, value]) => ({
              key,
              ...JSON.parse(value)
            }));
      
            // Envoyer les mises à jour au client
            ws.send(JSON.stringify({
              type: 'pixelboard_updates',
              pixelBoardId: pixelBoardId,
              updates: parsedUpdates
            }));
          } else {
            throw new Error('Type de message inconnu');
          }
        } catch (error) {
          console.error('Erreur de traitement du message:', error);
          ws.send(JSON.stringify({
            type: 'error',
            message: error
          }));
        }
    },

    // Gestion de la fermeture de connexion
    close(ws) {
      console.log('Connexion WebSocket fermée');
    }
  }
});

console.log(`Serveur WebSocket démarré sur le port ${PORT}`);

// Fonction d'arrêt propre
const shutdown = () => {
  server.stop();
  redisClient.quit();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);