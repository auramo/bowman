const runMigrations = (): void => {
  console.log('running migrations')
  const dbm = require('db-migrate').getInstance(true, {
    config: `${process.cwd()}/server/migration/database.json`,
    cwd: `${process.cwd()}/server/migration/`
  })
  dbm
    .up()
    .then(() => console.log('migration check completed'))
    .catch((err: unknown) => console.log('error running migrations', err))
}

export default runMigrations
