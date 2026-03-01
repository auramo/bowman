import * as actions from './actions'

export interface ErrorState {
  error: unknown
}

const initialState: ErrorState = { error: undefined }

export default (state = initialState, action: actions.HandleErrorAction | { type: string }): ErrorState => {
  switch (action.type) {
    case actions.HANDLE_ERROR:
      return { error: (action as actions.HandleErrorAction).error }
    default:
      return state
  }
}
