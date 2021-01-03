const paymentRepository = require('./paymentRepository')
const paymentTypeRepository = require('./paymentTypeRepository')
const payerRepository = require('./payerRepository')

module.exports.init = app => {
  app.get('/api/payments', async (req, res) => {
    const payments = await paymentRepository.getPayments(req.user.id)
    res.json({ payments })
  })

  app.get('/api/payment', async (req, res) => {
    const payment = await paymentRepository.getPayment(req.query.paymentId)
    res.json({ payment })
  })

  app.get('/api/paymentTypes', async (req, res) => {
    const paymentTypes = await paymentTypeRepository.getPaymentTypes()
    res.json({ paymentTypes })
  })

  app.get('/api/payers', async (req, res) => {
    const payers = await payerRepository.getPayers(req.user.id)
    res.json({ payers })
  })
}
