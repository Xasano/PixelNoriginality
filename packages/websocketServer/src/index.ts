// src/index.ts
import websocketService from './services/websocket.service';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

async function main() {
  try {
    // Démarrer le serveur WebSocket
    const server = websocketService.initServer(PORT);
    console.log(`Serveur démarré sur le port ${PORT}`);

    // Gestion de l'arrêt propre
    process.on('SIGINT', () => {
      console.log('Arrêt du serveur...');
      websocketService.stop();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('Arrêt du serveur...');
      websocketService.stop();
      process.exit(0);
    });

  } catch (error) {
    console.error('Erreur de démarrage du serveur:', error);
    process.exit(1);
  }
}

main();