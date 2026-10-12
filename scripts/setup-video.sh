#!/usr/bin/env bash
# Prépare l'environnement pour rendre des vidéos HyperFrames (idempotent).
# Lancé automatiquement au démarrage de chaque session cloud (voir .claude/settings.json).
set -uo pipefail

export HYPERFRAMES_SKIP_SKILLS=1

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "[video-setup] FFmpeg introuvable : installation…"
  (apt-get update -qq && apt-get install -y -qq ffmpeg) >/dev/null 2>&1 || echo "[video-setup] Échec de l'installation de FFmpeg"
fi

# Chrome Headless Shell, requis pour le rendu local (déjà en cache = instantané).
npx -y hyperframes browser ensure >/dev/null 2>&1 \
  && echo "[video-setup] Prêt à rendre des vidéos." \
  || echo "[video-setup] Échec de 'hyperframes browser ensure' — lancer 'npx hyperframes doctor'."
exit 0
