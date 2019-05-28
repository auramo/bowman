const camelize = require('camelize')
const db = require('../db/db')

const getPayments = async userId => {
  const rawPayments = await db.query(
    `SELECT p.amount_cents, p.payment_date, pua.name as payer_name, 
      pt.description as payment_type, p.description 
     FROM payment p
     JOIN payment_group pg ON p.payment_group_id = pg.id
     JOIN payment_group_user pgu ON pg.id = pgu.payment_group_id
     JOIN user_account gua ON pgu.user_account_id = gua.id
     JOIN user_account pua ON p.user_account_id = pua.id
     JOIN payment_type pt ON p.payment_type_id = pt.id
     WHERE gua.id = $1
     ORDER BY p.payment_date desc`,
    [userId]
  )
  return camelize(rawPayments)
}

module.exports = { getPayments }
