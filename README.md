# Bloom

Bloom permet de piloter certaines actions du client League of Legends depuis une PWA mobile. Le runtime Pengu charge un plugin dans le client LoL, mais le transport reseau LAN vivra dans un bridge Node.js local.

## Monorepo

- `bloom-plugin/` : plugin Pengu Loader dans le client LoL
- `bloom-bridge/` : futur pont Node.js local entre Pengu et le LAN
- `bloom-ui/` : interface mobile React 19 + TypeScript strict + Tailwind CSS v4

## Architecture actuelle

- le plugin appelle le LCU avec `fetch('/lol-...')`
- le plugin observe les events via `context.socket.observe(path, cb)`
- le serveur WebSocket LAN n'est pas dans le plugin
- le vrai transport LAN sera implemente dans `bloom-bridge/` en phase 2

## Lancement de l'UI

```bash
cd bloom-ui
npm install
npm run dev -- --host 0.0.0.0
```

Pour un build de production :

```bash
cd bloom-ui
npm run build
```

## Bridge local

Le dossier `bloom-bridge/` est un scaffold uniquement pour l'instant. Ce sera le seul endroit autorise a ouvrir le port `8765`.
