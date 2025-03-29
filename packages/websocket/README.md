# Pixel Board WebSocket Server

## 📝 Description

Un serveur WebSocket collaboratif pour un tableau de pixels en temps réel, permettant à plusieurs utilisateurs de dessiner et modifier un tableau pixel par pixel.

## ✨ Fonctionnalités

- Connexion WebSocket en temps réel
- Gestion de plusieurs tableaux de pixels
- Système de suivi des modifications par utilisateur

## 🚀 Prérequis

- Bun runtime
- Node.js (optionnel)

## 🔧 Installation

1. Installez les dépendances
```bash
bun install
```

## 🌟 Démarrage

### Développement
```bash
bun run dev
```

### Production
```bash
bun run start
```

## 📡 Types de Messages WebSocket

### 1. Abonnement
```json
{
  "type": "subscribe",
  "pixelBoardId": "board1"
}
```

### 2. Récupération des Mises à Jour
```json
{
  "type": "unsubscribe",
  "pixelBoardId": "board1"
}
```

### 3. Mise à jour de Pixel
```json
{
  "type": "update_pixel",
  "pixelBoardId": "board1",
  "x": 10,
  "y": 20,
  "color": "#FF0000"
}
```

## 🛠 Architecture

- `src/types/`: Définitions de types TypeScript
- `src/services/`: 
  - `websocket.service.ts`: Logique WebSocket
- `src/index.ts`: Point d'entrée principal

## 📦 Dépendances

- Bun
- TypeScript
