# RenderLab

Service fournisseur distribué sous forme de binaire Linux AMD64 / ARM64, dans un conteneur séparé. Aucun code serveur n’est inclus dans le checkout candidat ni monté dans le conteneur.

- Contrat HTTP : [PROVIDER.md](../PROVIDER.md).
- Client HTTP et routes Studio : [src/server/RenderLab](../src/server/RenderLab/).
- Démarrage : `docker compose up --build` depuis la racine.

Le Dockerfile télécharge une version précise et vérifie son SHA-256. Le service ne publie aucun port sur l’hôte et n’a aucun volume partagé avec Studio. Ne pas modifier ce service pour corriger l’exercice.

Le client HTTP reste lisible pour le candidat et son agent. Un fichier d’exclusion d’index n’est pas une barrière d’accès. Un administrateur Docker peut toujours inspecter une image ; une isolation stricte nécessiterait un fournisseur hébergé hors de sa machine.
