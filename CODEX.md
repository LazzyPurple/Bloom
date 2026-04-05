# Bloom

Bloom est un monorepo personnel pour piloter le client League of Legends a distance depuis un telephone mobile.

## Vision

- `bloom-plugin/` est un plugin Pengu Loader injecte dans le client LoL.
- `bloom-ui/` est une PWA React mobile qui parle uniquement au plugin via WebSocket LAN.
- Aucun serveur relay n'est autorise dans l'architecture.

## Architecture

### `bloom-plugin/`

- JavaScript vanilla uniquement
- Pas de bundler
- Pas d'import ESM externe
- Acces LCU via `fetch()`
- Ecoute des events via `context.socket`
- Expose le serveur WebSocket LAN sur le port `8765`

### `bloom-ui/`

- React 18
- TypeScript strict
- Tailwind CSS v3 uniquement
- PWA installable iOS
- Connexion directe vers `ws://IP_DU_PC:8765`

## Regles strictes

- L'UI ne doit jamais appeler le LCU directement.
- Tous les appels LCU passent par `bloom-plugin/src/lcu.js`.
- Le serveur WebSocket doit vivre dans le plugin, jamais dans un process Node separe.
- `WS_PORT = 8765` doit rester une constante dans `bloom-plugin/src/ws-server.js`.
- Le scaffold doit rester simple : pas de logique metier LCU tant que la phase 1 n'est pas ouverte.

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
    tailwind.config.ts
    tsconfig.json
    package.json

  CODEX.md
  README.md
```

## Phase actuelle

Objectif : scaffold complet et fonctionnel.

- Le plugin doit exposer des interfaces et stubs propres.
- L'UI doit compiler sans erreur TypeScript.
- Le routage `/connect` vers `/home` doit etre pret.
- Le manifeste PWA doit etre conforme a iOS standalone.

## Outils adjacents

- Pengu Loader : `https://pengu.lol`
- LCU API : `https://lcu.kebs.dev`
- Riot Client API : `https://riotclient.kebs.dev`
- Rose : `https://github.com/Alban1911/Rose`

## Notes de travail

- Favoriser des stubs explicites et des logs utiles.
- Garder les couches bien separees pour la phase 1.
- Toute extension future Rose doit passer par le plugin, jamais par l'UI directement.
