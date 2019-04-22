import { store } from '../store'

import * as actions from './actions'

export const handleError = error => {
  if (error.error) {
    console.error(error.error)
  }
  if (error.message) {
    console.error(error.message)
  }
  store.dispatch(actions.handleError(error))
}
