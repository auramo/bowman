import pgPromise from 'pg-promise'

const pgp = pgPromise({})

const config = {
  user: process.env.PGUSER,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT),
  max: 10,
  idleTimeoutMillis: 30000,
}

const db = pgp(config)

export default db
