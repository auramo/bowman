const paymentRepository = require('./paymentRepository')
const paymentTypeRepository = require('./paymentTypeRepository')
const payerRepository = require('./payerRepository')

module.exports.init = app => {
  app.get('/api/payments', async (req, res) => {
    const payments = await paymentRepository.getPayments(req.user.id)
    res.json({ payments })
  })

  app.get('/api/summary', async (req, res) => {
    const summary = await paymentRepository.getSummary(req.user.id)
    res.json({ summary })
  })

  app.get('/api/payment', async (req, res) => {
    const payment = await paymentRepository.getPayment(req.query.paymentId)
    res.json({ payment })
  })

  app.post('/api/payment', async (req, res) => {
    console.log('post body')
    console.log(req.body)
    const payment = await paymentRepository.addPayment(req.body, req.user.id)
    res.json({})
  })

  app.put('/api/payment', async (req, res) => {
    console.log('put body')
    console.log(req.body)
    const payment = await paymentRepository.updatePayment(req.body, req.user.id)
    res.json({})
  })

  app.delete('/api/payment', async (req, res) => {
    await paymentRepository.deletePayment(req.query.paymentId)
    res.json({})
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
