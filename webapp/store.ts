import { createStore, combineReducers } from 'redux'
import errorReducer from './errors/reducer'

export const rootReducer = combineReducers({
  errorState: errorReducer
})

export type RootState = ReturnType<typeof rootReducer>

export const store = createStore(rootReducer)
