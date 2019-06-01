const camelize = require('camelize')
const db = require('../db/db')

const getPaymentTypes = async () => {
  const rawPaymentTypes = await db.query(
    `SELECT id, description
     FROM payment_type
     ORDER BY description asc
     `
  )
  return camelize(rawPaymentTypes)
}

module.exports = { getPaymentTypes }
