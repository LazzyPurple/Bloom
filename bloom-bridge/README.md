# bloom-bridge

Pont Node.js local entre le plugin Pengu Loader et la PWA mobile Bloom.

## Role

- HTTP server sur `127.0.0.1:9000` : recoit les events du plugin (POST /event), sert les commandes au plugin (GET /commands)
- WebSocket server sur `0.0.0.0:8765` : connexion LAN directe avec la PWA

## Lancement

npm install
npm start

## Regle importante

Le bridge est le seul endroit autorise a ouvrir des ports reseau dans Bloom.
