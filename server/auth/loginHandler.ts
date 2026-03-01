import path from 'path'
import { errorResponse } from '../requestHelpers'
import * as R from 'ramda'
import { Express, Request, Response, NextFunction } from 'express'

const noLoginRequiredPaths = [
  /^\/login.*/,
  /^\/img\//,
  /^\/css\//,
  /^\/auth\/google.*/
]

const loginCheck = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    const acceptHeader = req.header('Accept')
    if (acceptHeader && acceptHeader.indexOf('application/json') !== -1) {
      res.status(401).json({ error: 'Not logged in' })
    } else {
      const redirectSuffix = req.url === '/' ? '' : req.url
      res.redirect('/login' + redirectSuffix)
    }
  } else {
    next()
  }
}

const loginPage = (req: Request, res: Response) =>
  res.sendFile(path.resolve(process.cwd(), 'web-resources/login.html'))

export const init = (app: Express): void => {
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (R.any((allowedRegex: RegExp) => !!req.path.match(allowedRegex), noLoginRequiredPaths)) {
      next()
    } else {
      loginCheck(req, res, next)
    }
  })

  app.use('/login*', async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.user) {
        res.redirect('/')
      } else {
        loginPage(req, res)
      }
    } catch (err) {
      errorResponse(res, err)
    }
  })

  app.get('/logout', (req: Request, res: Response) => {
    req.logout(() => {})
    res.redirect('/login')
  })
}
