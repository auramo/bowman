const initialState = { error: undefined }
import * as actions from './actions'

export default (state = initialState, action) => {
  switch (action.type) {
    case actions.HANDLE_ERROR:
      return { error: action.error }
    default:
      return state
  }
}
