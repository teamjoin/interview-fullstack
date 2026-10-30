# RenderLab — fournisseur fictif de génération vidéo

RenderLab représente le prestataire auquel Studio confie la fabrication d’une vidéo. Il accepte une demande de traitement, réalise le travail puis notifie son résultat. Studio reste responsable des relances et de l’état présenté à l’utilisateur. Une confirmation d’acceptation n’est pas un résultat de génération.

Dans l’exercice, ce service distant est remplacé par un simulateur local : aucun appel IA, aucune fabrication de fichier vidéo à l’exécution et aucun paiement réel. Les vidéos lisibles dans les cartes sont des clips de démonstration déjà fournis avec le dépôt. Les traitements appartiennent au conteneur RenderLab, pas à la base SQLite de Studio. Ce ne sont pas des tâches BullMQ. Ne changez pas ses garanties ou ses délais pour corriger le produit. Les données et les coûts sont fictifs.

## Envoyer un travail

Le client `submit(generationId, requestId?)`, dans `src/server/RenderLab/client.ts`, envoie `POST /v1/jobs` avec `{ "generationId": "gen-atelier", "requestId": "identifiant-optionnel" }`. Le fournisseur accepte un travail après un délai aléatoire de 400 à 1 600 ms puis renvoie `{ "jobId": "identifiant" }` (HTTP 202 pour une nouvelle demande, HTTP 200 pour une demande déjà connue). Le résultat arrive après un second délai aléatoire indépendant de 1,5 à 4,5 secondes par un POST vers `/api/providers/renderlab/results` sur l’API Studio. L’URL de destination est définie par `STUDIO_CALLBACK_URL` dans Compose. Chaque appel tire son délai d’acceptation ; chaque nouveau traitement tire son délai d’exécution. L’ordre de fin n’est donc pas garanti par l’ordre d’envoi.

Ces durées sont raccourcies pour l’entretien. Raisonnez comme pour un fournisseur externe asynchrone : la correction ne doit dépendre ni de ces bornes ni d’une attente fixe. Les contrôles de simulation restent disponibles pour reproduire un scénario précis sans compter sur le hasard.

- `requestId` est facultatif. Lorsqu’il est fourni, il est aussi l’identifiant du traitement chez ce fournisseur.
- Réutiliser le même identifiant avec la même génération retourne le traitement existant sans nouveau coût. Le réutiliser avec une autre génération est une erreur.
- Sans identifiant fourni, chaque appel crée un identifiant différent.
- Une erreur de transport peut survenir après acceptation : elle ne prouve pas que le travail n’a pas commencé. Le scénario de confirmation perdue ferme réellement la connexion HTTP après avoir accepté le travail.
- L’état du traitement et les événements sont consultables dans l’historique de démonstration. Les résultats de traitements terminés peuvent être renvoyés.

## Notifications

La route Studio valide le JSON puis le transmet à `receive` dans `generations.ts`. Chaque résultat contient `generationId`, `jobId` et `status` ; un échec contient aussi `error`. Les notifications peuvent être répétées ou retardées. Les relances ont des identifiants distincts. Dans ce simulateur, chaque traitement possède un unique résultat terminal, qui peut être renvoyé à l’identique.

## API d’observation et de simulation

Le panneau de l’exercice consulte `GET /v1/debug/snapshot` via Studio : `{ "jobs": [...], "events": [...] }`. Ces données d’observation ne sont pas le stockage des générations Studio. Le client fusionne les événements pour l’affichage.

Les commandes du panneau passent par Studio vers RenderLab :

- `POST /v1/simulator/reset` avec `{}`.
- `POST /v1/simulator/fail-next` avec `{}`.
- `POST /v1/simulator/lose-next-ack` avec `{}`.
- `POST /v1/simulator/replay` avec `{ "jobId": "initial-atelier" }`.

## Contrôles de la démo

- **Réinitialiser** : invalide le travail en attente chez RenderLab, puis remet les données Studio à leur état initial.
- **Faire échouer le prochain traitement** : l’acceptation réussit, puis l’exécution se termine en échec.
- **Perdre la prochaine confirmation** : le travail est accepté et se poursuit, mais l’appel `submit` lève une erreur de transport. La notification finale arrive tout de même.
- **Renvoyer le résultat** : rejoue une notification d’un traitement terminé.

Le contrôle « Perdre la prochaine confirmation » apparaît après **Suivant : confirmation perdue**, au début de la discussion avec l’interviewer. Passer à cette étape ne déclenche aucune erreur et ne modifie aucun traitement : il faut ensuite activer le scénario. Réinitialiser la démo revient à la première étape et annule les scénarios armés. L’étape affichée est locale à l’onglet et revient également au début lors d’un rechargement ; un rechargement seul n’annule pas un scénario déjà armé côté serveur.

Les commandes « prochain… » s’appliquent au prochain appel envoyé au simulateur et sont annulées par une réinitialisation. N’activez qu’un scénario à la fois pendant une démonstration.

## Limites

Le fournisseur conserve son état en mémoire : redémarrer RenderLab le réinitialise. Redémarrer Studio ne stoppe pas le fournisseur. Si une notification ne peut pas être livrée, RenderLab fait jusqu’à huit essais espacés de 500 ms, puis journalise `provider.delivery_failed` ; le rejeu manuel reste disponible. Après un redémarrage fournisseur ou une interruption prolongée, réinitialisez la démo. Le modèle ne simule pas le multi-tenant, les factures ni une panne de base.

Le serveur est livré comme binaire dans un conteneur sans source ni shell. Ce conditionnement matérialise la frontière fournisseur ; ce n’est pas une garantie de confidentialité face à quelqu’un qui contrôle Docker. Les anciennes versions du simulateur restent dans l’historique Git. Le contrat HTTP, le client et la réception des notifications restent accessibles à l’agent.
