# Design system minimal

Ouvrez `/design-system` sur le serveur local (par défaut http://localhost:4310/design-system). La galerie utilise les mêmes composants que le Studio ; ses boutons de démonstration ne modifient pas les données de l’exercice.

## Fondations

`src/web/ui/tokens.css` définit les couleurs sémantiques, la typographie, les espacements sur une base de 4 pixels, les rayons, les ombres et la durée des transitions. `components.css` porte les styles des primitives. Le violet désigne l’action principale ; chaque statut associe une couleur et un libellé.

## Composants

- `Button` : variantes principale, secondaire, discrète et destructive ; deux tailles ; attributs natifs du bouton.
- `Badge` : statut neutre, succès, attente ou erreur.
- `Notice` : information ou erreur, avec annonce accessible à la demande.
- `Icon` : pictogrammes SVG décoratifs partagés.
- `GenerationCard` et `GenerationPreview` : assemblage métier des primitives, illustration d’échec, attente animée et lecteur vidéo.

Les styles de mise en page restent dans `src/web/style.css`. Les règles responsive adaptent la navigation et les cartes aux écrans étroits. Le focus clavier reste visible ; les animations respectent `prefers-reduced-motion`.

## Médias

Les vidéos démarrent uniquement après une action de l’utilisateur, puis exposent les commandes natives du navigateur. Elles sont silencieuses et locales. Le lecteur reste monté pendant les actualisations d’une même tentative ; un changement de tentative ou de statut remplace l’aperçu. Une erreur de lecture est affichée séparément d’un échec de génération.

Les fichiers et leur provenance sont documentés dans [public/media/README.md](public/media/README.md). Leur association aux trois produits fictifs se trouve dans `src/web/components/demo-media.ts`. Il s’agit de fixtures de présentation, pas d’une intégration de génération vidéo réelle.
