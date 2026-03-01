# PostgreSQL Major Version Upgrade (13 → 18.3)

PostgreSQL major version upgrades require a dump-and-restore because the internal data storage format changes between major versions. This document describes the process for upgrading the production database.

## Prerequisites

- `psql` and `pg_dump` CLI tools available on the machine performing the migration
- Access to the running PostgreSQL 13 instance
- Ability to stop the application during the migration (there will be downtime)

## Steps

### 1. Dump data from the old PostgreSQL 13 instance

```bash
docker exec bowman_postgres_1 pg_dump -U bowman bowman > bowman_pg13_dump.sql
```

Verify the dump file is non-empty and contains your data:

```bash
wc -c bowman_pg13_dump.sql
grep "COPY public.payment " bowman_pg13_dump.sql
```

Test the dump locally on dev machine:

```
podman stop bowman
podman rm -v bowman
podman exec -i bowman psql -U bowman -d bowman < bowman_pg13_dump_1.3.2026.sql
```

### 2. Stop the application

Stop the web application so no new data is written during the migration.

### 3. Stop and remove the old PostgreSQL 13 container

```bash

docker stop bowman_postgres_1
sudo docker rm -v bowman_postgres_1
```

### 4. Start a new PostgreSQL 18.3 container

```bash
# Edit the version 18 to the server's docker-compose.yml, then:
sudo /usr/local/bin/docker-compose up -d
```

### 5. Restore the dump into PostgreSQL 18.3

```bash
sudo docker exec -i bowman_postgres_1 psql -U bowman -d bowman < bowman_pg13_dump.sql
```

## Notes

- The old container's data volume is destroyed when the container is removed. Keep the dump file as a backup until you've verified the new instance works.
- If using `docker-compose`, update the image in `docker-compose.yml` from `postgres:13` to `postgres:18.3` before running `docker-compose up`.
- Replace `docker` with `podman` if using Podman.
