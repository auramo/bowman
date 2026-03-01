import { Response } from 'express'

export const errorResponse = (res: Response, err: unknown): void => {
  console.error(err)
  res.status(500).json({ error: 'Server error', err })
}

export const okResponse = (res: Response): void => {
  res.json({})
}
