# Proyecto

Despliegue automático:
- Next.js (export estático) -> HostGator vía FTP (GitHub Actions).
- Node/Express -> Render.com (Docker-free) y dominio desde HostGator (DNS/CNAME).

Variables de entorno: use .env en local y “Secrets” en GitHub/Render.
