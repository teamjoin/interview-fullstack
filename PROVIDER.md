# RenderLab — fournisseur fictif de génération vidéo

RenderLab représente le prestataire auquel Studio confie la fabrication d’une vidéo. Il accepte une demande de traitement, réalise le travail puis notifie son résultat. Studio reste responsable des relances et de l’état présenté à l’utilisateur. Une confirmation d’acceptation n’est pas un résultat de génération.

Dans l’exercice, ce service distant est remplacé par un simulateur local : aucun appel IA, aucune fabrication de fichier vidéo à l’exécution et aucun paiement réel. Les vidéos lisibles dans les cartes sont des clips de démonstration déjà fournis avec le dépôt. Les lignes `jobs` sont les traitements du fournisseur, pas des tâches BullMQ. Ne changez pas ses garanties ou ses délais pour corriger le produit. Les données et les coûts sont fictifs.

## Envoyer un travail

`submit(generationId, requestId?)` accepte un travail après un délai aléatoire de 400 à 1 600 ms puis renvoie son identifiant. Le résultat arrive après un second délai aléatoire indépendant de 1,5 à 4,5 secondes via le callback enregistré par `onResult`. Chaque appel tire son délai d’acceptation ; chaque nouveau traitement tire son délai d’exécution. L’ordre de fin n’est donc pas garanti par l’ordre d’envoi.

Ces durées sont raccourcies pour l’entretien. Raisonnez comme pour un fournisseur externe asynchrone : la correction ne doit dépendre ni de ces bornes ni d’une attente fixe. Les contrôles de simulation restent disponibles pour reproduire un scénario précis sans compter sur le hasard.

- `requestId` est facultatif. Lorsqu’il est fourni, il est aussi l’identifiant du traitement chez ce fournisseur.
- Réutiliser le même identifiant avec la même génération retourne le traitement existant sans nouveau coût. Le réutiliser avec une autre génération est une erreur.
- Sans identifiant fourni, chaque appel crée un identifiant différent.
- Une erreur de transport peut survenir après acceptation : elle ne prouve pas que le travail n’a pas commencé.
- L’état du traitement et les événements sont consultables dans l’historique de démonstration. Les résultats de traitements terminés peuvent être renvoyés.

## Notifications

Chaque résultat contient `generationId`, `jobId` et `status` ; un échec contient aussi `error`. Les notifications peuvent être répétées ou retardées. Les relances ont des identifiants distincts. Dans ce simulateur, chaque traitement possède un unique résultat terminal, qui peut être renvoyé à l’identique.

## Contrôles de la démo

- **Réinitialiser** : annule les timers et remet les données fictives à leur état initial.
- **Faire échouer le prochain traitement** : l’acceptation réussit, puis l’exécution se termine en échec.
- **Perdre la prochaine confirmation** : le travail est accepté et se poursuit, mais l’appel `submit` lève une erreur de transport. La notification finale arrive tout de même.
- **Renvoyer le résultat** : rejoue une notification d’un traitement terminé.

Le contrôle « Perdre la prochaine confirmation » apparaît après **Suivant : confirmation perdue**, au début de la discussion avec l’interviewer. Passer à cette étape ne déclenche aucune erreur et ne modifie aucun traitement : il faut ensuite activer le scénario. Réinitialiser la démo revient à la première étape et annule les scénarios armés. L’étape affichée est locale à l’onglet et revient également au début lors d’un rechargement ; un rechargement seul n’annule pas un scénario déjà armé côté serveur.

Les commandes « prochain… » s’appliquent au prochain appel envoyé au simulateur et sont annulées par une réinitialisation. N’activez qu’un scénario à la fois pendant une démonstration.

## Limites

Les timers ne survivent pas au redémarrage de l’API. Le modèle ne simule pas les callbacks perdus définitivement, le multi-tenant, les factures ni une panne de base. Après une modification serveur pendant une génération, réinitialisez les données.
