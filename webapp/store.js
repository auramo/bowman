import { createStore, combineReducers } from 'redux'
import errorReducer from './errors/reducer'

export const rootReducer = combineReducers({
  errorState: errorReducer
})

export const store = createStore(rootReducer)
