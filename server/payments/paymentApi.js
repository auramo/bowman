const paymentRepository = require('./paymentRepository')

module.exports.init = app => {
  app.get('/api/payments', async (req, res) => {
    const payments = await paymentRepository.getPayments(req.user.id)
    res.json({ payments })
  })
}
