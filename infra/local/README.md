# Local Infrastructure

Docker Compose stack for local development. Starts Keycloak and its dedicated Postgres instance. This stack is for **local dev only** — staging and production use a managed Keycloak service.

## Services

| Service | Port | Description |
|---|---|---|
| Keycloak | 8080 | Identity provider — admin console at `http://localhost:8080` |
| keycloak-db | 5433 | Postgres for Keycloak only (not the app database) |

## First-time setup

1. Copy `.env.example` to `.env` and fill in the values:

```sh
cp .env.example .env
# edit .env with real passwords
```

2. Start the stack:

```sh
docker compose up -d
```

3. Wait for Keycloak to be healthy (about 60–90 seconds on first boot):

```sh
docker compose ps
# keycloak service should show "healthy"
```

4. Open the admin console: `http://localhost:8080`
   - Log in with the credentials from your `.env` (`KEYCLOAK_ADMIN` / `KEYCLOAK_ADMIN_PASSWORD`)
   - The `bbc` realm is imported automatically from `infra/keycloak/bbc-realm.json`

## Realm import

The `bbc-realm.json` file is bind-mounted into Keycloak's import directory. On first start, Keycloak imports it automatically when started with `start-dev --import-realm`. If the realm already exists, Keycloak skips the import.

To force a re-import after realm changes:
1. Stop the stack: `docker compose down`
2. Remove the Keycloak DB volume: `docker volume rm local_keycloak-db-data`
3. Start again: `docker compose up -d`

## Client secrets

Dev-only placeholder secrets are baked into `bbc-realm.json`:

| Client | Dev secret |
|---|---|
| `mobile-bff` | `dev-mobile-bff-secret` |
| `coach-bff` | `dev-coach-bff-secret` |

**These must be rotated before any staging or production deployment.** Set new secrets via the Keycloak admin console (Clients → [client] → Credentials → Regenerate) and update each BFF service's environment config accordingly.

## Stopping and cleaning up

```sh
# Stop containers, keep volumes
docker compose down

# Stop and remove all volumes (resets Keycloak DB)
docker compose down -v
```

## Keycloak version

Pinned to `quay.io/keycloak/keycloak:26.2`. To upgrade, change the image tag in `docker-compose.yml`, test locally, then commit the bump.
