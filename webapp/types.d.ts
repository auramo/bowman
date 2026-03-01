declare const __SYSTEM_VERSION__: string
declare const __BUST__: string

declare module '*.less' {
  const content: { [className: string]: string }
  export default content
}

declare module 'route-parser' {
  export default class Route {
    constructor(spec: string)
    match(path: string): Record<string, string> | false
    reverse(params?: Record<string, string>): string | false
  }
}

declare module 'camelize' {
  function camelize<T>(obj: unknown): T
  export = camelize
}

declare module 'express-promise-router' {
  import { Router } from 'express'
  export default function promiseRouter(): Router
}
