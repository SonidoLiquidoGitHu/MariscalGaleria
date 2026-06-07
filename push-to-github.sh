#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# Galería Mariscal — Script de subida automática a GitHub
# ──────────────────────────────────────────────────────────────────────────────
#
# USO:
#   Opción 1 — Con Deploy Key SSH (recomendado):
#     ./push-to-github.sh
#
#   Opción 2 — Con Personal Access Token (PAT):
#     GITHUB_TOKEN=tu_token_aqui ./push-to-github.sh
#
# ──────────────────────────────────────────────────────────────────────────────

set -euo pipefail

REPO_URL="https://github.com/SonidoLiquidoGitHu/MariscalGaleria.git"
SSH_REPO_URL="git@github.com:SonidoLiquidoGitHu/MariscalGaleria.git"
BRANCH="main"

echo "╔══════════════════════════════════════════════════════════╗"
echo "║   Galería Mariscal — Subida a GitHub                    ║"
echo "║   Joyería de Autor, Plata 925, Zacatecas México        ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

cd "$(git rev-parse --show-toplevel)"

# ─── Stage all changes ─────────────────────────────────────────────────────
echo "📦 Preparando archivos..."
git add -A

# Check if there are changes to commit
if git diff --staged --quiet; then
  echo "✅ No hay cambios nuevos para subir."
else
  echo "📝 Creando commit..."
  COMMIT_MSG="feat: actualización Galería Mariscal — $(date '+%Y-%m-%d %H:%M')"
  git commit -m "$COMMIT_MSG"
  echo "✅ Commit creado: $COMMIT_MSG"
fi

# ─── Determine push method ─────────────────────────────────────────────────
if [ -n "${GITHUB_TOKEN:-}" ]; then
  echo "🔑 Usando Personal Access Token..."
  # Configure token-based auth
  git remote set-url origin "https://${GITHUB_TOKEN}@github.com/SonidoLiquidoGitHu/MariscalGaleria.git"
  PUSH_URL="origin"
else
  echo "🔑 Usando SSH Deploy Key..."
  git remote set-url origin "$SSH_REPO_URL"
  PUSH_URL="origin"
fi

# ─── Push ───────────────────────────────────────────────────────────────────
echo "🚀 Subiendo a GitHub..."

# Use paramiko SSH wrapper if native ssh is not available
if ! command -v ssh &> /dev/null; then
  export GIT_SSH_COMMAND="$HOME/.local/bin/git-ssh-wrapper"
fi

if git push -u "$PUSH_URL" "$BRANCH"; then
  echo ""
  echo "╔══════════════════════════════════════════════════════════╗"
  echo "║   ✅ Subida exitosa!                                    ║"
  echo "║                                                          ║"
  echo "║   Repositorio:                                          ║"
  echo "║   https://github.com/SonidoLiquidoGitHu/MariscalGaleria ║"
  echo "╚══════════════════════════════════════════════════════════╝"
else
  echo ""
  echo "❌ Error al subir. Verifica tus credenciales."
  echo ""
  echo "Opciones para resolver:"
  echo ""
  echo "1. Agregar Deploy Key SSH:"
  echo "   Ve a: https://github.com/SonidoLiquidoGitHu/MariscalGaleria/settings/keys"
  echo "   Agrega la clave pública SSH del servidor con permisos de escritura."
  echo ""
  echo "2. Usar Personal Access Token:"
  echo "   GITHUB_TOKEN=tu_token ./push-to-github.sh"
  echo ""
  exit 1
fi

# Reset URL to clean form (remove token from URL if used)
if [ -n "${GITHUB_TOKEN:-}" ]; then
  git remote set-url origin "$REPO_URL"
fi
