import { store } from '../store'
import * as actions from './actions'

export const handleError = (error: unknown): void => {
  if (error && typeof error === 'object') {
    if ('error' in error) {
      console.error((error as { error: unknown }).error)
    }
    if ('message' in error) {
      console.error((error as { message: unknown }).message)
    }
  }
  store.dispatch(actions.handleError(error))
}
