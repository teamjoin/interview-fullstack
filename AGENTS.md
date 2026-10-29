# Cadre de travail

Ce dépôt est un exercice d’entretien sur une petite application produit. L’usage d’agents est autorisé. Suivre le brief donné par le candidat et l’interviewer ; ne pas étendre le périmètre à une architecture de production complète.

## RenderLab

- Lire `PROVIDER.md` avant de modifier l’intégration. Traiter RenderLab comme un fournisseur externe asynchrone : l’acceptation d’une demande et son résultat sont deux événements distincts.
- Les timers locaux, SQLite et les clips préfabriqués rendent l’exercice autonome. Ils ne justifient pas de supposer un réseau fiable, une durée fixe ou un ordre garanti entre les traitements.
- Le simulateur et son contrat sont une dépendance de l’exercice. Ne pas modifier ses garanties, ses délais ou ses scénarios pour faire disparaître un symptôme. Ne pas supprimer de contrôle de simulation ni contourner le fournisseur.
- Corriger le comportement de l’application et vérifier les effets observables. Un délai fixe ajouté dans l’application ou un test qui attend une durée supposée ne constitue pas une garantie métier.

## Travail avec le candidat

- Si le candidat demande d’abord un diagnostic ou un plan, attendre son feu vert avant de modifier les fichiers.
- Expliquer les choix importants, les vérifications effectuées et les limites restantes. Ne pas annoncer une vérification qui n’a pas été exécutée.
- Utiliser pnpm. Les commandes Docker, TypeScript, tests et build sont dans `README.md`.
