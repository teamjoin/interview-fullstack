# JOIN · Full-stack interview

Une petite application React / TypeScript / Node.js pour travailler ensemble sur un problème produit. Toutes les données sont fictives. Le fournisseur de génération vidéo est simulé : aucune clé d'API, aucun compte AWS et aucun coût d'IA ne sont nécessaires pour faire fonctionner l'application.

## Avant l'entretien

Installez Docker Desktop ou un moteur compatible avec Docker Compose v2, ainsi que Git. Prévoyez votre éditeur et votre agent de développement habituel. La documentation et l'IA sont autorisées. Un accès de secours peut être organisé avec votre interlocuteur.

Vérifiez uniquement le démarrage avant l'entretien ; aucun correctif ni travail à domicile n'est demandé. Nous présenterons le sujet et les attentes ensemble.

```sh
git clone https://github.com/teamjoin/interview-fullstack.git
cd interview-fullstack
docker compose up --build
```

Ouvrez **http://localhost:4310**. Le premier démarrage télécharge les dépendances ; faites-le avant le rendez-vous. Le code `src/` est monté dans Docker : vos modifications sont rechargées automatiquement.

Port occupé : `APP_PORT=4311 docker compose up --build`. Sous PowerShell : `$env:APP_PORT=4311; docker compose up --build`.

## Pendant l'exercice

L'application affiche des générations vidéo, leur état et un bouton de relance. Les outils de développement, en bas de page, permettent de remettre les données à zéro, simuler un échec du prochain traitement et renvoyer une notification fournisseur. L'historique montre les traitements acceptés et les événements.

Chaque traitement accepté par le fournisseur représente un travail facturable, même s'il finit en échec. La simulation met environ 600 ms à accepter une demande puis 2,5 secondes à produire un résultat. La livraison des notifications peut être répétée et un ancien résultat peut arriver après un plus récent.

Le problème produit sera présenté au début de la session. Vous pouvez poser les questions que vous poseriez au Product ou à un collègue. Nous nous intéressons à votre démarche, vos décisions et vos vérifications. La finition graphique n'est pas évaluée.

## Se repérer

- `src/web/` : interface React et styles.
- `src/server/app.ts` : routes HTTP.
- `src/server/generations.ts` : logique des générations.
- `src/server/provider.ts` : simulateur du fournisseur.
- `src/server/store.ts` : base SQLite persistante et données initiales.
- `src/shared/contracts.ts` : contrats des échanges.

La base SQLite est dans le volume Docker `studio-data`. Il s'agit d'un seul espace de démonstration : authentification, multi-tenant, facturation réelle et production sont hors périmètre. Les timers du simulateur ne survivent pas au redémarrage de l'API ; après un redémarrage pendant un traitement, réinitialisez la démo. Il n'est pas demandé de construire un système distribué.

## Commandes utiles

```sh
# Vérification TypeScript
docker compose exec api pnpm typecheck

# Tests existants (socle de démarrage, pas une couverture complète du produit)
docker compose exec api pnpm test

# Build de l'interface
docker compose exec web pnpm build

# Logs
docker compose logs -f api

# Arrêter en conservant les données
docker compose down
```

Pour repartir des données fictives initiales, utilisez **Outils de développement → Réinitialiser la démo**. Cela supprime seulement les données locales de cet exercice.

Sans Docker : Node 24.15+ et pnpm 12.4.1, puis `pnpm install --frozen-lockfile`, `pnpm dev:api` et `pnpm dev:web` dans deux terminaux. Ouvrez alors http://localhost:5173.

## Cadre

L'entretien dure 90 minutes, dont 50 minutes de travail sur l'application. Un échange reverse de 30 minutes est prévu séparément pour vos questions sur JOIN. Aucun livrable exploité en production et aucun exercice à rendre chez vous ne sont demandés.

Ce dépôt est un support d'entretien volontairement imparfait, pas un exemple d'architecture de production.
