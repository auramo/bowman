import passport from 'passport'
import * as R from 'ramda'
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth'
import cookieParser from 'cookie-parser'
import * as userRepository from '../user/userRepository'
import { okResponse } from '../requestHelpers'
import express, { Express, Request, Response, NextFunction } from 'express'
import { UserAccount } from '../../common/types'

const verifyCallback = async (
  req: Request,
  accessToken: string,
  refreshToken: string,
  profile: passport.Profile,
  done: (err: unknown, user?: UserAccount | false, info?: { message: string }) => void
) => {
  const userFetchCallback = (user: UserAccount | null) =>
    user ? done(null, user) : done(null, false, { message: 'User not authorized' })

  try {
    const email = profile.emails![0].value.toLowerCase()
    const user = await userRepository.findUserByLogin(email)
    userFetchCallback(user)
  } catch (e) {
    console.log('Error occurred while authenticating', e)
    done(null, false, { message: 'Error occurred: ' + e })
  }
}

const authenticationFailed = (req: Request, res: Response) => {
  req.logout(() => {})
  res.redirect('/login?failed=true')
}

const authenticationSuccessful = (req: Request, user: UserAccount, next: NextFunction, res: Response) => {
  const redirectTo = R.isEmpty(req.session.desiredUrlAfterLogin || '') ? '/' : req.session.desiredUrlAfterLogin!
  req.logIn(user, err => {
    if (err) {
      next(err)
    } else {
      req.session.save(() => res.redirect(redirectTo))
    }
  })
}

export const init = (app: Express): void => {
  app.use(cookieParser() as unknown as express.RequestHandler)
  app.use(passport.initialize() as unknown as express.RequestHandler)
  app.use(passport.session() as unknown as express.RequestHandler)

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: process.env.GOOGLE_CLIENT_CALLBACK_URL!,
        passReqToCallback: true
      },
      verifyCallback as unknown as (...args: unknown[]) => void
    )
  )

  passport.serializeUser((user, done) => {
    done(null, user)
  })

  passport.deserializeUser((user: Express.User, done) => {
    done(null, user)
  })

  app.get('/auth/googlelogin*', (req: Request, res: Response, next: NextFunction) => {
    req.session.desiredUrlAfterLogin = req.url.substr('/auth/googlelogin'.length)
    return passport.authenticate('google', { scope: ['profile', 'email'], state: undefined as unknown as string })(
      req,
      res,
      next
    )
  })

  app.get('/auth/google/callback', (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('google', (err: unknown, user: UserAccount | false) => {
      if (err) {
        next(err)
      } else if (!user) {
        authenticationFailed(req, res)
      } else {
        authenticationSuccessful(req, user, next, res)
      }
    })(req, res, next)
  })

  app.post('/auth/logout', (req: Request, res: Response) => {
    req.logout(() => {})
    okResponse(res)
  })
}
