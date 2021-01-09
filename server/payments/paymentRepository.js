const camelize = require('camelize')
const db = require('../db/db')
const money = require('../../common/money')
const R = require('ramda')
const { format } = require('date-fns')
const { parseDate } = require('../../common/date')

const uuidv4 = require('uuid/v4')

const getPayments = async userId => {
  const rawPayments = await db.query(
    `SELECT p.id, p.amount_cents, p.payment_date, pua.name as payer_name, 
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

const getSummary = async userId => {
  const summary = await db.query(
    `SELECT SUM(amount_cents) as sum, 
                ua.name as payer, 
                ua.id 
    FROM payment p join user_account ua on p.user_account_id = ua.id 
    WHERE p.payment_group_id = (SELECT pg.id FROM payment_group pg 
                                JOIN payment_group_user pgu ON pg.id = pgu.payment_group_id 
                                WHERE pgu.user_account_id = 2) 
    GROUP BY ua.id`,
    [userId]
  )
  return camelize(summary)
}

const getPayment = async paymentId => {
  console.log('getPayment', paymentId)
  const rawPayments = await db.query(
    `SELECT p.id, 
            p.amount_cents, 
            p.payment_date, 
            p.user_account_id as payer_id, 
           p.payment_type_id, p.description 
     FROM payment p
     WHERE p.id = $1`,
    [paymentId]
  )
  if (rawPayments.length === 0) return null
  const dbPayment = camelize(rawPayments[0])
  const payment = R.dissoc('amountCents', {
    ...dbPayment,
    amount: money.centsToString(dbPayment.amountCents),
    paymentDate: format(dbPayment.paymentDate, 'DD.MM.YYYY')
  })
  return payment
}

const addPayment = async (payment, userId) => {
  await db.query(
    `INSERT INTO payment (
      id, 
      amount_cents, 
      payment_date, 
      payment_type_id, 
      description, 
      user_account_id,
      payment_group_id)
     VALUES
     ($1, 
      $2, 
      $3, 
      $4, 
      $5, 
      $6, 
      (SELECT pg.id FROM payment_group pg
        JOIN payment_group_user pgu ON pg.id = pgu.payment_group_id 
        WHERE pgu.user_account_id = $7)
      )`,
    [
      uuidv4(),
      money.stringToCents(payment.amount),
      parseDate(payment.paymentDate),
      payment.paymentTypeId,
      payment.description,
      payment.payerId,
      userId
    ]
  )
}

const updatePayment = async (payment, userId) => {
  await db.query(
    `UPDATE payment SET 
      amount_cents = $2,
      payment_date = $3,
      payment_type_id = $4, 
      description = $5, 
      user_account_id = $6, 
      payment_group_id = (SELECT pg.id FROM payment_group pg
                         JOIN payment_group_user pgu ON pg.id = pgu.payment_group_id 
                         WHERE pgu.user_account_id = $7)
      WHERE id = $1`,
    [
      payment.id,
      money.stringToCents(payment.amount),
      parseDate(payment.paymentDate),
      payment.paymentTypeId,
      payment.description,
      payment.payerId,
      userId
    ]
  )
}

const deletePayment = async paymentId => {
  await db.query(`DELETE FROM payment WHERE id = $1`, [paymentId])
}

module.exports = { getPayments, getSummary, getPayment, addPayment, updatePayment, deletePayment }
