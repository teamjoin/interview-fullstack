# RenderLab — fournisseur fictif de génération vidéo

RenderLab représente le prestataire auquel Studio confie la fabrication d’une vidéo. Il accepte une demande de traitement, réalise le travail puis notifie son résultat. Studio reste responsable des relances et de l’état présenté à l’utilisateur. Une confirmation d’acceptation n’est pas un résultat de génération.

Dans l’exercice, ce service distant est remplacé par un simulateur local : aucun appel IA, aucune fabrication de fichier vidéo à l’exécution et aucun paiement réel. Les vidéos lisibles dans les cartes sont des clips de démonstration déjà fournis avec le dépôt. Les lignes `jobs` sont les traitements du fournisseur, pas des tâches BullMQ. Ne changez pas ses garanties ou ses délais pour corriger le produit. Les données et les coûts sont fictifs.

## Envoyer un travail

`submit(generationId, requestId?)` accepte un travail en environ 600 ms puis renvoie son identifiant. Le résultat arrive environ 2,5 secondes plus tard via le callback enregistré par `onResult`.

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

Les commandes « prochain… » s’appliquent au prochain appel envoyé au simulateur et sont annulées par une réinitialisation. N’activez qu’un scénario à la fois pendant une démonstration.

## Limites

Les timers ne survivent pas au redémarrage de l’API. Le modèle ne simule pas les callbacks perdus définitivement, le multi-tenant, les factures ni une panne de base. Après une modification serveur pendant une génération, réinitialisez les données.
