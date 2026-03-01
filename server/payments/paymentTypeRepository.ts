import camelize from 'camelize'
import db from '../db/db'
import { PaymentType } from '../../common/types'

export const getPaymentTypes = async (): Promise<PaymentType[]> => {
  const rawPaymentTypes = await db.query(
    `SELECT id, description
     FROM payment_type
     ORDER BY description asc
     `
  )
  return camelize<PaymentType[]>(rawPaymentTypes)
}
