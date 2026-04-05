# Bloom

Bloom permet de piloter certaines actions du client League of Legends depuis une PWA mobile, via une connexion WebSocket locale entre le telephone et un plugin Pengu Loader.

## Monorepo

- `bloom-plugin/` : plugin Pengu Loader injecte dans le client LoL
- `bloom-ui/` : interface mobile React 19 + TypeScript strict + Tailwind CSS v4

## Prerequis

- Pengu Loader installe et fonctionnel
- League of Legends lance sur le PC
- Node.js recent pour l'UI
- Le PC et le telephone sur le meme reseau local

## Installation du plugin Pengu

1. Copier le dossier `bloom-plugin/` dans le dossier `plugins/` de Pengu Loader.
2. Demarrer League of Legends avec Pengu Loader actif.
3. Verifier dans les logs Pengu que Bloom affiche son message de demarrage.

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

## Connexion mobile

1. Recuperer l'adresse IP locale du PC.
2. Ouvrir l'UI Bloom depuis le navigateur du telephone.
3. Saisir l'IP du PC dans la page `Connect`.
4. L'UI se connecte au plugin sur `ws://IP_DU_PC:8765`.
5. Une fois connecte, la page `Home` expose les commandes WebSocket de base.

## PWA iOS

- `display: "standalone"`
- `start_url: "/"`
- icones `192x192` et `512x512`
- theme color `#6C3CE1`

## Etat actuel

Ce depot contient le scaffold initial de la nouvelle stack :

- wrappers LCU
- serveur WebSocket du plugin
- hook React `useBloomWS`
- pages `Connect` et `Home`
- aucune logique metier LCU avancee pour le moment
