import { UserAccount } from '../../common/types'

declare global {
  namespace Express {
    interface User extends UserAccount {}
  }
}

declare module 'express-session' {
  interface SessionData {
    desiredUrlAfterLogin: string
  }
}
