import 'dotenv/config'
import promiseRouter from 'express-promise-router'
import path from 'path'
import * as sessionInitializer from './sessionInitializer'
import * as loginHandler from './auth/loginHandler'
import * as userApi from './user/userApi'
import * as paymentApi from './payments/paymentApi'
import * as authenticator from './auth/authenticator'
import * as headerMiddleware from './headerMiddleware'
import runMigrations from './migration/migrationRunner'

import express, { Request, Response, NextFunction } from 'express'
import bodyParser from 'body-parser'
import compression from 'compression'

const app = express()

runMigrations()

headerMiddleware.init(app)
sessionInitializer.init(app)
authenticator.init(app)
loginHandler.init(app)

app.use(compression({ threshold: 512 }) as unknown as express.RequestHandler)

const clientAppHtml = (req: Request, res: Response) =>
  res.sendFile(path.resolve(process.cwd(), 'dist/index.html'))
app.use('/payments*', clientAppHtml)
app.use('/newPayment*', clientAppHtml)
app.use('/shoppingList*', clientAppHtml)
app.use('/', express.static(path.resolve(process.cwd(), 'dist')))

app.use('/img/', express.static(path.resolve(process.cwd(), 'web-resources/img')))
app.use('/css/', express.static(path.resolve(process.cwd(), 'web-resources/css')))

app.use(bodyParser.json({ limit: '5000kb' }))
const apiRouter = promiseRouter()
userApi.init(apiRouter)
paymentApi.init(apiRouter)
apiRouter.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(err)
  }
  console.error(err.stack)
  res.status(500).send({ error: err.message })
})
app.use(apiRouter)

const httpServerPort = process.env.PORT || '8080'
app.listen(httpServerPort, () => {
  console.log('server listening on port', httpServerPort)
})
