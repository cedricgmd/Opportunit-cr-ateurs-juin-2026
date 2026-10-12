# Vidéos avec HyperFrames

Ce dépôt est configuré pour créer des vidéos avec les skills HeyGen HyperFrames (`.claude/skills/`).
Point d'entrée obligatoire pour toute demande de vidéo : le skill `/hyperframes`.

## Environnement

- Au démarrage de chaque session, `scripts/setup-video.sh` installe/vérifie Chrome Headless Shell et FFmpeg.
  En cas de doute : `npx hyperframes doctor`.
- Lancer les commandes HyperFrames avec `HYPERFRAMES_SKIP_SKILLS=1` (les skills sont déjà versionnés ici).

## Emplacement des projets

- Chaque vidéo est un projet dans `videos/<nom>/` (créé avec `npx hyperframes init <nom> --non-interactive` depuis `videos/`).
- Rendu final : `videos/<nom>/renders/<nom>.mp4`. Committer le projet et le MP4 final pour qu'ils survivent à la session.

## Réseau : cdn.jsdelivr.net est bloqué

La politique réseau de l'environnement cloud bloque `cdn.jsdelivr.net`, d'où les modèles HyperFrames
chargent GSAP, Three.js, etc. Sans correctif, le rendu échoue avec
`sub_timeline_script_failure ... Cannot read properties of null (reading 'timeline')`.

Après chaque `init`, `add` ou ajout de HTML contenant une URL jsdelivr, et avant `check`/`render`, lancer :

```bash
node scripts/vendor-cdn.mjs videos/<nom>
```

Le script télécharge les paquets via le registre npm (autorisé) dans `videos/<nom>/vendor/` et réécrit les URLs.
Les autres CDN (Google Fonts, unpkg…) peuvent aussi être bloqués : vérifier la sortie de `npx hyperframes check`.
