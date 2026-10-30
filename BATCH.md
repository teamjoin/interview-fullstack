# Relance d’une sélection

Un marchand veut relancer les vidéos en échec de son catalogue en une action, avec une sélection pouvant atteindre 500 vidéos. Cette PR ajoute l’API utilisée par la future sélection multiple dans Studio.

## Appel

`POST /api/generation-batches/retry`

```json
{ "generationIds": ["gen-atelier", "gen-horizon"] }
```

Les identifiants doivent être distincts, entre 1 et 500 par requête. Chaque vidéo est soumise aux mêmes règles que la relance individuelle. La réponse HTTP 202 contient `batchId`, le nombre `accepted` et les couples `generationId` / `jobId`. Le résultat des vidéos arrive ensuite via les notifications RenderLab habituelles.

Après avoir réinitialisé la démo, on peut essayer les deux vidéos initialement en échec :

```sh
curl -X POST http://localhost:4310/api/generation-batches/retry \
  -H 'Content-Type: application/json' \
  -d '{"generationIds":["gen-atelier","gen-horizon"]}'
```

La démo contient trois vidéos ; les 500 correspondent au volume cible d’un catalogue. Le bouton de sélection multiple n’est pas inclus dans cette PR.
