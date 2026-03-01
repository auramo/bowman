import { Express, Request, Response, NextFunction } from 'express'

export const init = (app: Express): void => {
  const bundleRegexp = /^\/bundle-.*\.js(\.map)?$|^\/styles-.*\.css(\.map)?$/
  const bustRegexp = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  const apiRegexp = /^\/api\/.*/i
  const maxAgeSeconds = 60 * 60 * 24 * 365

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.match(apiRegexp)) {
      res.set('Cache-Control', 'no-store')
    } else if (req.path.match(bundleRegexp)) {
      res.set('Cache-Control', `public, max-age=${maxAgeSeconds}`)
    } else if (req.query.bust && (req.query.bust as string).match(bustRegexp)) {
      res.set('Cache-Control', `public, max-age=${maxAgeSeconds}`)
    } else {
      res.set('Cache-Control', 'no-store')
    }
    next()
  })
}
