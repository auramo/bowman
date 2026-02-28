# PostgreSQL Major Version Upgrade (13 → 18.3)

PostgreSQL major version upgrades require a dump-and-restore because the internal data storage format changes between major versions. This document describes the process for upgrading the production database.

## Prerequisites

- `psql` and `pg_dump` CLI tools available on the machine performing the migration
- Access to the running PostgreSQL 13 instance
- Ability to stop the application during the migration (there will be downtime)

## Steps

### 1. Dump data from the old PostgreSQL 13 instance

```bash
PGHOST=<host> PGPORT=<port> PGUSER=bowman PGPASSWORD=<password> \
  pg_dump bowman > bowman_pg13_dump.sql
```

Verify the dump file is non-empty and contains your data:

```bash
wc -c bowman_pg13_dump.sql
grep "COPY public.payment " bowman_pg13_dump.sql
```

### 2. Stop the application

Stop the web application so no new data is written during the migration.

### 3. Stop and remove the old PostgreSQL 13 container

```bash
docker stop bowman
docker rm bowman
```

### 4. Start a new PostgreSQL 18.3 container

```bash
docker run -d --name bowman \
  -p 5435:5432 \
  -e POSTGRES_DB=bowman \
  -e POSTGRES_USER=bowman \
  -e POSTGRES_PASSWORD=<password> \
  postgres:18.3
```

Wait a few seconds for PostgreSQL to initialize, then verify it's running:

```bash
PGHOST=<host> PGPORT=<port> PGUSER=bowman PGPASSWORD=<password> \
  psql -d bowman -c "SELECT version();"
```

### 5. Restore the dump into PostgreSQL 18.3

```bash
PGHOST=<host> PGPORT=<port> PGUSER=bowman PGPASSWORD=<password> \
  psql -d bowman < bowman_pg13_dump.sql
```

### 6. Verify the data

```bash
PGHOST=<host> PGPORT=<port> PGUSER=bowman PGPASSWORD=<password> \
  psql -d bowman -c "
    SELECT 'users' as tbl, count(*) FROM user_account
    UNION ALL SELECT 'payments', count(*) FROM payment
    UNION ALL SELECT 'payment_types', count(*) FROM payment_type
    UNION ALL SELECT 'groups', count(*) FROM payment_group
    UNION ALL SELECT 'group_users', count(*) FROM payment_group_user;
  "
```

Compare the row counts against what you had before the migration.

### 7. Start the application

Start the web application and verify it connects and works correctly. Users will need to log in again since session data in the old volume is gone.

## Notes

- The old container's data volume is destroyed when the container is removed. Keep the dump file as a backup until you've verified the new instance works.
- If using `docker-compose`, update the image in `docker-compose.yml` from `postgres:13` to `postgres:18.3` before running `docker-compose up`.
- Replace `docker` with `podman` if using Podman.
