import camelize from 'camelize'
import db from '../db/db'
import * as money from '../../common/money'

import { format } from 'date-fns'
import { parseDate } from '../../common/date'
import { v4 as uuidv4 } from 'uuid'
import { PaymentListItem, PaymentDetail, PaymentFormData, SummaryRow, SummaryResponse } from '../../common/types'

export const getPayments = async (userId: number): Promise<PaymentListItem[]> => {
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
  return camelize<PaymentListItem[]>(rawPayments)
}

export const getSummary = async (userId: number): Promise<SummaryResponse> => {
  const summary = await db.query(
    `SELECT SUM(amount_cents) as sum,
                ua.name as payer,
                ua.id
    FROM payment p join user_account ua on p.user_account_id = ua.id
    WHERE p.payment_group_id = (SELECT pg.id FROM payment_group pg
                                JOIN payment_group_user pgu ON pg.id = pgu.payment_group_id
                                WHERE pgu.user_account_id = $1)
    GROUP BY ua.id`,
    [userId]
  )
  const camelized = camelize<SummaryRow[]>(summary)

  let min: number | null = null
  let minPayerId: number | null = null
  camelized.forEach(row => {
    if (min === null || row.sum < min) {
      min = row.sum
      minPayerId = row.id
    }
  })
  const enrichedSummary = camelized.map(row =>
    row.id === minPayerId ? { ...row, minPayer: true } : row
  )

  const countResult = await db.query(
    `SELECT COUNT(*)::int as count
     FROM payment p
     WHERE p.payment_group_id = (SELECT pg.id FROM payment_group pg
                                  JOIN payment_group_user pgu ON pg.id = pgu.payment_group_id
                                  WHERE pgu.user_account_id = $1)`,
    [userId]
  )
  const paymentCount: number = countResult[0].count

  return { summary: enrichedSummary, paymentCount }
}

export const getPayment = async (paymentId: string): Promise<PaymentDetail | null> => {
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
  const dbPayment = camelize<Record<string, unknown>>(rawPayments[0])
  const merged: Record<string, unknown> = {
    ...dbPayment,
    amount: money.centsToString(dbPayment.amountCents as number),
    paymentDate: format(dbPayment.paymentDate as Date, 'dd.MM.yyyy')
  }
  delete merged.amountCents
  return merged as unknown as PaymentDetail
}

export const addPayment = async (payment: PaymentFormData, userId: number): Promise<void> => {
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

export const updatePayment = async (payment: PaymentFormData, userId: number): Promise<void> => {
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

export const deletePayment = async (paymentId: string): Promise<void> => {
  await db.query(`DELETE FROM payment WHERE id = $1`, [paymentId])
}
