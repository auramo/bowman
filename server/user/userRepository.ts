import camelize from 'camelize'
import db from '../db/db'
import { UserAccount } from '../../common/types'

export const findUserByLogin = async (login: string): Promise<UserAccount | null> => {
  const res = await db.query(
    `SELECT id, login, name
      FROM user_account WHERE LOWER(login) = $1
    `,
    [login]
  )
  return res.length > 0 ? camelize<UserAccount>(res[0]) : null
}
