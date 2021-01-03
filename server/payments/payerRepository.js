const camelize = require('camelize')
const db = require('../db/db')

const getPayers = async userId => {
  const rawPayers = await db.query(
    `SELECT ua.id, ua.name 
         FROM user_account ua
         JOIN payment_group_user pgu ON ua.id = pgu.user_account_id
         JOIN payment_group pg ON pgu.payment_group_id = pg.id
         WHERE pg.id IN  (SELECT pg.id FROM payment_group pg
                           JOIN payment_group_user pgu ON pg.id = pgu.payment_group_id 
                           WHERE pgu.user_account_id = $1)
         ORDER BY ua.name asc`,
    [userId]
  )
  return camelize(rawPayers)
}

module.exports = { getPayers }
