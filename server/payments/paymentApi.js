const paymentRepository = require('./paymentRepository')
const paymentTypeRepository = require('./paymentTypeRepository')

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
}
