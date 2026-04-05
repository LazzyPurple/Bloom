# Bloom

Bloom permet de piloter certaines actions du client League of Legends depuis une PWA mobile. Le runtime Pengu charge un plugin dans le client LoL, et un bridge Node.js local porte le transport entre le plugin et le reseau LAN.

## Monorepo

- `bloom-plugin/` : plugin Pengu Loader dans le client LoL
- `bloom-bridge/` : pont Node.js local entre Pengu et le LAN
- `bloom-ui/` : interface mobile React 19 + TypeScript strict + Tailwind CSS v4

## Architecture actuelle

- le plugin appelle le LCU avec `fetch('/lol-...')`
- le plugin observe les events via `context.socket.observe(path, cb)`
- le plugin POST les events au bridge sur `http://127.0.0.1:9000/event`
- le plugin poll les commandes sur `http://127.0.0.1:9000/commands`
- le bridge expose le WebSocket LAN sur `ws://IP_DU_PC:8765`

## Lancement complet

1. Demarrer League of Legends avec Pengu Loader.
2. Lancer le bridge :

```bash
cd bloom-bridge
npm install
npm start
```

3. Lancer l'UI :

```bash
cd bloom-ui
npm install
npm run dev -- --host 0.0.0.0
```

4. Sur le telephone : ouvrir `http://IP_DU_PC:5173`, saisir l'IP du PC, puis se connecter.

## Build UI

```bash
cd bloom-ui
npm run build
```

## Bridge local

Le dossier `bloom-bridge/` est le seul endroit autorise a ouvrir le port `8765`.
