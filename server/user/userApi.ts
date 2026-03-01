import { Router } from 'express'

export const init = (app: Router): void => {
  app.get('/api/user', (req, res) => {
    res.json({ user: req.user })
  })
}
