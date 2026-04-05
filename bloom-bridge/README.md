# bloom-bridge

`bloom-bridge/` est le futur pont Node.js entre le plugin Pengu et l'interface mobile Bloom.

## Role

- exposer le vrai serveur WebSocket LAN sur le port `8765`
- recevoir les evenements emis par le plugin Pengu
- relayer les commandes de la PWA vers le plugin via un canal local a definir en phase 2

## Statut

Phase 1.5 : scaffold uniquement. Aucun serveur reseau n'est encore implemente ici.

## Regle importante

Le bridge sera le seul endroit autorise a ouvrir un port reseau pour Bloom.
