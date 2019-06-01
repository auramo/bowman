require('dotenv').config()
const promiseRouter = require('express-promise-router')
const path = require('path')
const sessionInitializer = require('./sessionInitializer')
const loginHandler = require('./auth/loginHandler')
const userApi = require('./user/userApi')
const paymentApi = require('./payments/paymentApi')
const authenticator = require('./auth/authenticator')
const headerMiddleware = require('./headerMiddleware')
const runMigrations = require('./migration/migrationRunner')

const express = require('express')
const bodyParser = require('body-parser')
const compression = require('compression')

const app = express()

runMigrations()

headerMiddleware.init(app)
sessionInitializer.init(app)
authenticator.init(app)
loginHandler.init(app)

app.use(compression({ threshold: 512 }))

const apiRouter = promiseRouter()
userApi.init(apiRouter)
paymentApi.init(apiRouter)
apiRouter.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err)
  }
  console.error(err.stack)
  res.status(500).send({ error: err.message })
})
app.use(apiRouter)

const clientAppHtml = (req, res) => res.sendFile(path.resolve(`${__dirname}/../dist/index.html`))
app.use('/payments*', clientAppHtml)
app.use('/newPayment*', clientAppHtml)
app.use('/shoppingList*', clientAppHtml)
app.use('/', express.static(`${__dirname}/../dist`))

app.use('/img/', express.static(`${__dirname}/../web-resources/img`))
app.use('/css/', express.static(`${__dirname}/../web-resources/css`))
app.use(bodyParser.json({ limit: '5000kb' }))

const httpServerPort = process.env.PORT || '8080'
app.listen(httpServerPort, () => {
  console.log('server listening on port', httpServerPort)
})
