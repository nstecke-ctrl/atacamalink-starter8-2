#!/usr/bin/env bash
set -e

# ========== CONFIGURA ESTAS 4 VARIABLES ==========
GH_USER="tu-usuario-github"           # <-- cámbialo
REPO_NAME="mi-web-node"               # <-- cámbialo
GH_EMAIL="tu-correo@ejemplo.com"      # <-- cámbialo
DEFAULT_BRANCH="main"
# ================================================

echo ">> Preparando .gitignore y archivos base…"
cat > .gitignore <<'EOF'
# Node / JS
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-store
.next
out
dist
build
coverage
.cache
# OS
.DS_Store
Thumbs.db
# Env
.env
.env.*
# Misc
*.log
EOF

# .env.example vacío (para documentar variables)
if [ ! -f .env.example ]; then
  echo "# Agrega aquí NOMBRES de variables (sin valores)" > .env.example
fi

# README mínimo si no existe
if [ ! -f README.md ]; then
cat > README.md <<'EOF'
# Proyecto

Despliegue automático:
- Next.js (export estático) -> HostGator vía FTP (GitHub Actions).
- Node/Express -> Render.com (Docker-free) y dominio desde HostGator (DNS/CNAME).

Variables de entorno: use .env en local y “Secrets” en GitHub/Render.
EOF
fi

# Detectar si es Next.js (buscando "next" en package.json)
IS_NEXTJS="no"
if [ -f package.json ] && grep -q '"next"' package.json; then
  IS_NEXTJS="si"
fi

# Asegurar scripts de build
if [ "$IS_NEXTJS" = "si" ]; then
  echo ">> Detectado Next.js. Ajustando package.json para export estático…"
  # Añadir scripts build/export si faltan
  node -e '
  const fs = require("fs");
  const p = JSON.parse(fs.readFileSync("package.json","utf8"));
  p.scripts = p.scripts || {};
  if (!p.scripts.build) p.scripts.build = "next build";
  if (!p.scripts.export) p.scripts.export = "next export";
  if (!p.scripts["deploy:static"]) p.scripts["deploy:static"] = "npm run build && npm run export";
  fs.writeFileSync("package.json", JSON.stringify(p, null, 2));
  ' || true

  # Workflow de GitHub Actions: build + export + deploy por FTP a HostGator
  mkdir -p .github/workflows
  cat > .github/workflows/deploy-hostgator.yml <<'EOF'
name: Build & Deploy (HostGator FTP)

on:
  push:
    branches: [ "main" ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install deps
        run: npm ci

      - name: Build & Export
        run: |
          npm run build
          npm run export   # genera carpeta "out/"

      - name: Deploy via FTP
        uses: SamKirkland/FTP-Deploy-Action@v4.3.5
        with:
          server: ${{ secrets.FTP_SERVER }}
          username: ${{ secrets.FTP_USERNAME }}
          password: ${{ secrets.FTP_PASSWORD }}
          local-dir: out
          server-dir: ${{ secrets.FTP_DIR }}
          protocol: ftps
          security: strict
EOF

  # PHP simple para formularios (opcional)
  mkdir -p public_html_samples
  cat > public_html_samples/contacto.php <<'EOF'
<?php
// Cambia $to, y opcionalmente configura SMTP en el hosting
$to = "ventas@tudominio.cl";
$subject = "Contacto web";
$name = $_POST['name'] ?? '';
$email = $_POST['email'] ?? '';
$message = $_POST['message'] ?? '';
$body = "Nombre: $name\nEmail: $email\nMensaje:\n$message";
$headers = "From: no-reply@tudominio.cl\r\nReply-To: $email\r\n";
if (mail($to, $subject, $body, $headers)) {
  echo "OK";
} else {
  http_response_code(500);
  echo "ERROR";
}
?>
EOF

else
  echo ">> No es Next.js. Creando config para Render (Node/Express)…"

  # render.yaml (auto deploy desde GitHub)
  cat > render.yaml <<'EOF'
services:
  - type: web
    name: node-backend
    env: node
    buildCommand: npm ci
    startCommand: npm start
    plan: starter
    autoDeploy: true
    envVars:
      - key: NODE_ENV
        value: production
EOF

  # README de dominio desde HostGator (DNS)
  cat >> README.md <<'EOF'

## Dominio en HostGator apuntando a Render
1. Crea el servicio en Render conectando este repo (detecta `render.yaml`).
2. Obtén la URL pública (ej: https://node-backend.onrender.com).
3. En el cPanel de HostGator (Zona DNS):
   - Crea un CNAME para `www` -> tu URL de Render (sin `https://`).
   - Opcional: redirige @ (root) a `www` con un registro A hacia el proxy de tu preferencia o usa un redirect en .htaccess.
4. Configura variables de entorno en Render (Dashboard > Environment).
EOF
fi

echo ">> Inicializando Git y creando repo remoto…"
git init
git config user.name "$GH_USER"
git config user.email "$GH_EMAIL"
git add .
git commit -m "chore: bootstrap deploy"

# Crear repo en GitHub vía gh CLI si está disponible
if command -v gh >/dev/null 2>&1; then
  echo ">> Detectado gh (GitHub CLI). Creando repo $GH_USER/$REPO_NAME…"
  gh repo create "$GH_USER/$REPO_NAME" --public -y || true
  git branch -M "$DEFAULT_BRANCH"
  git remote add origin "https://github.com/$GH_USER/$REPO_NAME.git" || true
  git push -u origin "$DEFAULT_BRANCH"
else
  echo ">> gh CLI no encontrado. Crea el repo manualmente en GitHub y pega esta línea:"
  echo "git branch -M $DEFAULT_BRANCH"
  echo "git remote add origin https://github.com/$GH_USER/$REPO_NAME.git"
  echo "git push -u origin $DEFAULT_BRANCH"
fi

echo ">> Listo."
if [ "$IS_NEXTJS" = "si" ]; then
  cat <<'MSG'

================================================================
NEXT.JS + HOSTGATOR (FTP)
1) Entra al repositorio en GitHub > Settings > Secrets and variables > Actions:
   - FTP_SERVER     (por ej: ftp.tudominio.cl)
   - FTP_USERNAME   (usuario FTP)
   - FTP_PASSWORD   (contraseña FTP)
   - FTP_DIR        (ej: /public_html)
2) Haz un commit/push a main -> GitHub Actions construirá y subirá "out/" por FTP.
3) (Opcional) Sube public_html_samples/contacto.php a /public_html/contacto.php y apúntalo desde tu formulario.
================================================================
MSG
else
  cat <<'MSG'

================================================================
NODE/EXPRESS + RENDER
1) En Render.com: "New > Web Service" -> "Build from a Git repo" y elige este repo.
2) Render leerá render.yaml y hará deploy automático.
3) En HostGator (DNS): crea CNAME www -> tu subdominio de Render (sin https://).
4) Apunta el dominio principal al www (redirect/alias).
================================================================
MSG
fi

