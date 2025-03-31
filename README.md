# PixelNoriginality - Plateforme de Pixel Art Collaboratif

## Présentation du projet

L'application permet aux utilisateurs de:
- Créer et participer à des tableaux de pixels (PixelBoards)
- Placer un pixel à la fois avec un délai entre chaque contribution
- Visualiser les œuvres en cours et terminées
- Suivre leurs contributions et statistiques personnelles

Les administrateurs peuvent gérer les PixelBoards:
- Créer des nouveaux tableaux avec des paramètres personnalisés
- Modifier ou supprimer les tableaux existants
- Filtrer et trier la liste des PixelBoards

L'application permet aux visiteurs de:
- Visualiser les œuvres en cours et terminées
- Accéder à un mode visiteur avec des limitations quotidiennes (5 pixels par jour)
- Explorer les PixelBoards sans avoir besoin de créer un compte
- Participer à des tableaux de pixels avec des restrictions

## Participants et contributions

### Participant 1
- **LE BORGNE Killian** ([@K-LeBorgn](https://github.com/K-LeBorgn))
- **Tâches réalisées**:
  Architecture et structure du projet :
    - Initialisation du projet en monorepo
    - Configuration du linter de code pour l'API et le client
    - Mise en place de la structure de base et du routing
    - Gestion globale du projet (gestion des branches Git, résolution des bugs rencontrés au cours du développement, mise en place du déploiement et conception de l'architecture du projet)

  Système d'authentification complet :
    - Développement du modèle utilisateur et de la gestion des rôles coté backend 
    - Implémentation du système JWT avec génération et vérification de tokens
    - Création des endpoints d'authentification (login, register, logout)
  
  Interface et interactions de dessin : 
    - Développement du canvas interactif pour le placement de pixels
    - Implémentation du système de zoom, navigation et sélection de couleurs
    - Gestion des contraintes de participation (délais, validation)
    - Création des indicateurs en temps réel (couleur, position, temps d'attente)

  Fonctionnalités avancées :
    - Développement du système d'export des PixelBoards (SVG et PNG)
    - Implémentation du mode "replay" pour visualiser l'historique de création
    - Création du header PixelBoard avec informations dynamiques
  
  Gestion des thèmes
    - Implémentation du switch thème (clair/sombre)
    - Détection automatique du thème système

### Participant 2
- **FERNANDES DE FARIA Patrick** ([@patrickf2a](https://github.com/patrickf2a))
- **Tâches réalisées**:

  Système d'authentification et gestion des utilisateurs : 
    - Développement des composants d'authentification (login et inscription)
    - Création du service d'authentification avec gestion des tokens
    - Mise en place de la validation des formulaires
  
  Fonctionnalités d'administration : 
    - Conception du tableau de bord administrateur
    - Développement de l'interface de création de PixelBoard
    - Implémentation des systèmes de modification et suppression de PixelBoard 
    - Création des systèmes de filtrage et tri des PixelBoards
  
  Gestion des visiteurs et expérience utilisateur : 
    - Développement du système de tracking pour visiteurs non-inscrits
    - Adaptation de l'interface de dessin avec limitations spécifiques
    - Implémentation du système de conversion Visiteur → Utilisateur
    - Conservation des contributions lors de l'inscription

  Interface utilisateur générale : 
    - Intégration des éléments d'authentification dans la navigation
    - Création de la section PixelBoards en cours avec prévisualisations
    - Contribution aux endpoints API pour les statistiques globales

### Participant 3
- **LEFUMEUX Bastien** ([@Xasano](https://github.com/Xasano))
- **Tâches réalisées**:
  Développement de l'infrastructure et déploiement :
    - Mise en place de l'environnement Docker avec configuration multi-services
    - Déploiement du projet en ligne sur DigitalOcean avec configuration complète
    - Création des pipelines CI/CD pour l'automatisation du déploiement
    - Configuration des conteneurs pour l'environnement de production
  
  Développement backend et temps réel : 
    - Mise en place du système WebSocket pour les mises à jour en temps réel
    - Création du système de validation des actions utilisateurs
    - Creation systeme de recupération de mots de passe 
  
  Gestion des utilisateurs et sécurité : 
    - Développement du modèle utilisateur étendu avec préférences et statistiques
    - Mise en place de la protection des routes et gestion des autorisations
    - Création des endpoints de gestion de profil utilisateur

### Participant 4
- **BRANDI Julien** ([@JulienBrandi](https://github.com/JulienBrandi))
- **Tâches réalisées**:
  - Développement de l'interface pour la visualisation des PixelBoards terminés
  - Création du système de statistiques globales pour la plateforme
  - Développement du modèle de données pour le suivi des contributions utilisateurs
  - Participation à la creation de la HomePage
  - Création des tickets pour tableau de bord Kanban

## Fonctionnalités implémentées

### Fonctionnalités de base
- ✅ Création et gestion de PixelBoards
- ✅ Placement de pixels avec délai entre chaque contribution
- ✅ Système d'authentification et gestion des utilisateurs
- ✅ Mode visiteur avec limitations quotidiennes
- ✅ Interface d'administration
- ✅ Thème clair/sombre avec détection automatique des préférences système

### Bonus implémentés
- ✅ WebSockets pour les mises à jour en temps réel
- ✅ Export des PixelBoards en SVG et PNG
- ✅ Mode "replay" pour visualiser l'historique de création
- ✅ Statistiques utilisateur détaillées
- ✅ Déploiement en ligne du projet sur DigitalOcean

## Technologies utilisées

- **Frontend**: React, TailwindCSS
- **Backend**: Node.js, Express
- **Base de données**: MongoDB avec Mongoose
- **Temps réel**: WebSockets avec bun
- **Authentification**: JWT
- **Conteneurisation**: Docker et Docker Compose

## Prérequis

- Node.js (v18 ou supérieur)
- npm (v9 ou supérieur)
- Docker et Docker Compose
- Git

## Variables d'environnement sans docker compose

Créez un fichier `.env` dans le répertoire `packages/api` afin de pouvoir lancer en local en vous basant sur l'exemple fourni:

**packages/api/.env** si les services sont lancés sans le docker compose
```
ACCESS_TOKEN_SECRET=mbdsgroupetrois
REFRESH_TOKEN_SECRET=mbdsgroupetrois
MONGO_URL=mongodb://root:root@localhost:27017
INIT_SECRET_KEY=pixelnoriginality_admin_init_2025
```

## Variables d'environnement avec docker compose

Créez un fichier `.env` dans le répertoire `packages/api` afin de pouvoir lancer en local en vous basant sur l'exemple fourni:

**packages/api/.env**
```
ACCESS_TOKEN_SECRET=mbdsgroupetrois
REFRESH_TOKEN_SECRET=mbdsgroupetrois
MONGO_URL=mongodb://root:root@mongodb-pixelnoriginality:27017
INIT_SECRET_KEY=pixelnoriginality_admin_init_2025
```

## Installation et démarrage avec npm

### 1. Cloner le dépôt

```bash
git clone https://github.com/Xasano/PixelNoriginality.git
cd PixelNoriginality
```
### 2. Installer les dépendances à la racine du projet

```bash
npm install
```

### 3. Lancer la base de données MongoDB avec Docker

```bash
docker-compose -f "docker-compose-dev.yml" up -d mongodb-pixelnoriginality
```

### 4. Lancer le serveur WebSocket

```bash
npm run start:ws
```

### 5. Démarrer l'API backend

```bash
npm run start:api
```

### 6. Démarrer le frontend

Dans un nouveau terminal:
```bash
npm run start:client
```

## Installation et démarrage avec docker compose

### 1. Cloner le dépôt

```bash
git clone https://github.com/Xasano/PixelNoriginality.git
cd PixelNoriginality
```

### 2

### 3. Lancer l'application avec Docker Compose

```bash
docker compose -f docker-compose-dev.yml up --build -d
```

L'application est maintenant accessible à l'adresse [http://localhost](http://localhost)

### 7. Initialiser un compte administrateur (après le premier lancement)

Utilisez cURL ou Postman pour créer le premier compte administrateur pour pouvoir créer des boards et gérer l'application. Remplacez `your_init_secret_key` par la clé secrète définie dans votre fichier `.env`:

```bash
curl -X POST http://localhost:8000/api/auth/init \
  -H "Content-Type: application/json" \
  -d '{"name":"admin","email":"admin@example.com","password":"Admin123!","secretKey":"pixelnoriginality_admin_init_2025"}'
```

## Accès à l'application (Exemple)

### Utilisateur administrateur par défaut
- **Email**: admin@example.com
- **Mot de passe**: Admin123!

### Utilisateur standard (exemple)
- **Email**: user@example.com
- **Mot de passe**: Password123

## Accès en ligne

Le projet est déployé en ligne et accessible à l'adresse suivante:

**URL du projet**: [https://pixelnoriginality.fun](https://pixelnoriginality.fun)

### Informations sur le déploiement
- **Hébergement**: DigitalOcean
- **Architecture**: Containers Docker avec Nginx en reverse proxy

### Remarques sur la version en ligne
- La version de production est synchronisée avec la branche `main` du dépôt
- Les mises à jour sont déployées automatiquement via un pipeline CI/CD

## Structure du projet

Le projet est organisé en monorepo avec les packages suivants:

- `packages/client`: Frontend React avec TailwindCSS
- `packages/api`: Backend Express + MongoDB
- `packages/websocket`: Service WebSocket pour les mises à jour en temps réel

### Architecture technique

- Le frontend utilise React avec hooks, contexts et composants réutilisables
- Le backend suit une architecture RESTful avec routes, controllers et services
- Les WebSockets permettent la mise à jour en temps réel des pixels placés
- L'authentification est gérée par JWT avec refresh tokens
- La base de données MongoDB stocke les utilisateurs, PixelBoards et pixels

## Fonctionnalités détaillées

### Mode Visiteur
Les visiteurs non-inscrits peuvent:
- Placer jusqu'à 5 pixels par jour
- Créer un compte pour conserver leurs contributions
- Explorer et visualiser tous les tableaux publics

### Mode Replay
- Permet de voir l'évolution d'un tableau dans le temps
- Visualise les pixels placés dans l'ordre chronologique
- Plusieurs vitesses de replay disponibles

### Export d'images
- Format SVG pour une qualité vectorielle
- Format PNG pour une utilisation web standard