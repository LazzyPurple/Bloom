# Bloom

Bloom est un monorepo personnel pour piloter le client League of Legends a distance depuis un telephone mobile.

## Vision

- `bloom-plugin/` est un plugin Pengu Loader injecte dans le client LoL.
- `bloom-bridge/` sera un pont Node.js local entre le plugin et le reseau LAN.
- `bloom-ui/` est une PWA React mobile qui parle uniquement au bridge via WebSocket LAN.
- Aucun serveur relay distant n'est autorise dans l'architecture.

## Architecture reelle

### `bloom-plugin/`

- JavaScript vanilla uniquement
- Pas de bundler
- Pas d'import ESM externe
- Acces LCU via `fetch()` relatif dans le runtime CEF
- Ecoute des events via `context.socket.observe(path, cb)`
- Ne peut pas ouvrir de port TCP ou WebSocket
- Utilise `console.info/warn/error` directement

### `bloom-bridge/`

- Processus Node.js local
- Sera le seul endroit autorise a ouvrir le port `8765`
- Portera le transport entre plugin et UI en phase 2

### `bloom-ui/`

- Vite 7
- React 19
- TypeScript strict
- Tailwind CSS v4 via `@tailwindcss/vite`
- PWA installable iOS
- Connexion directe vers `ws://IP_DU_PC:8765`

## Regles strictes

- `context.socket.observe(path, cb)` est la seule API valide pour les events LCU.
- `context.logger` n'existe pas.
- `globalThis.WebSocketServer` n'existe pas dans Pengu.
- Tous les appels LCU passent par `bloom-plugin/src/lcu.js`.
- Le plugin JS CEF ne peut pas ouvrir de port reseau.
- Le vrai serveur WebSocket vivra dans `bloom-bridge/`.
- Tailwind v4 doit etre configure dans `bloom-ui/src/index.css` via `@theme`.
- Pas de `tailwind.config.ts`.
- Pas de `postcss.config.cjs`.

## Protocol WebSocket

### Plugin vers UI

```json
{ "type": "gameflow", "phase": "Lobby" }
{ "type": "champselect", "session": {} }
{ "type": "readycheck", "playerResponse": "None" }
{ "type": "pong" }
```

### UI vers Plugin

```json
{ "cmd": "ping" }
{ "cmd": "accept" }
{ "cmd": "createLobby", "queueId": 420 }
{ "cmd": "startSearch" }
{ "cmd": "stopSearch" }
{ "cmd": "lockChamp", "championId": 157 }
```

## Structure attendue

```text
bloom/
  bloom-plugin/
    index.js
    src/
      ws-server.js
      lcu.js
      events.js
    package.json

  bloom-bridge/
    index.js
    package.json
    README.md

  bloom-ui/
    index.html
    public/
      manifest.json
      icon-192.png
      icon-512.png
    src/
      main.tsx
      App.tsx
      hooks/
        useBloomWS.ts
      pages/
        Connect.tsx
        Home.tsx
      components/
        StatusBadge.tsx
    vite.config.ts
    tsconfig.json
    package.json

  CODEX.md
  README.md
```

## Phase actuelle

Phase 1.5 - Plugin realigne sur le runtime Pengu reel.

- Le plugin utilise `context.socket.observe()` pour les events LCU.
- `ws-server.js` reste en stub mode explicite.
- `bloom-bridge/` existe comme scaffold, mais n'ouvre encore aucun port.
- `bloom-ui/` ne change pas dans cette phase.

## Outils adjacents

- Pengu Loader : `https://pengu.lol`
- LCU API : `https://lcu.kebs.dev`
- Riot Client API : `https://riotclient.kebs.dev`
- Rose : `https://github.com/Alban1911/Rose`
