declare module 'camelize' {
  function camelize<T>(obj: unknown): T
  export = camelize
}

declare module 'passport-google-oauth' {
  import { Strategy } from 'passport'

  export class OAuth2Strategy extends Strategy {
    constructor(
      options: {
        clientID: string
        clientSecret: string
        callbackURL: string
        passReqToCallback?: boolean
      },
      verify: (...args: unknown[]) => void
    )
  }
}
