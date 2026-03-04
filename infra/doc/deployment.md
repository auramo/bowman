# Ansible Deployment Infrastructure

## Directory Structure

| File | Purpose |
|------|---------|
| `ansible.cfg` | Sets inventory path, disables host key checking |
| `inventory.ini` | Placeholder for EC2 host — fill in IP and SSH key path |
| `playbook.yml` | Main playbook running roles: podman → app → nginx → certbot |
| `roles/podman/tasks/main.yml` | Installs `podman` and `podman-compose` via apt |
| `roles/app/tasks/main.yml` | Creates `/opt/bowman`, copies `.env`, templates compose file, pulls image, runs `podman-compose up -d` |
| `roles/app/templates/compose.yml.j2` | Production compose: uses pre-built image, localhost-only port binding, `.env` file for web, pgdata volume |
| `roles/nginx/tasks/main.yml` | Installs nginx, templates site config, symlinks to sites-enabled, removes default site |
| `roles/nginx/handlers/main.yml` | Handler to reload nginx on config changes |
| `roles/nginx/templates/bowman.conf.j2` | Reverse proxy on port 80 → `127.0.0.1:8080` with standard proxy headers |
| `roles/certbot/tasks/main.yml` | Installs certbot, obtains Let's Encrypt cert (idempotent via `creates:`) |

## Before Running

1. Add your server IP and SSH key path to `inventory.ini`
2. Set the `CERTBOT_EMAIL` env var (or it defaults to `you@example.com`)
3. Run from the `infra/` directory: `cd infra && ansible-playbook playbook.yml`
