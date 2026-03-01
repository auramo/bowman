import session from 'express-session'
import connectPgSimple from 'connect-pg-simple'
import express, { Express } from 'express'
import db from './db/db'

const pgSession = connectPgSimple(session)

const sessionOptions: session.SessionOptions = {
  secret: process.env.COOKIE_SECRET!,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: false },
  store: new pgSession({
    pgPromise: db,
    tableName: 'user_sessions'
  })
}

export const init = (app: Express): void => {
  app.use(session(sessionOptions) as unknown as express.RequestHandler)
}
