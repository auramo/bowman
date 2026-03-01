export const HANDLE_ERROR = 'errors/HANDLE_ERROR'

export interface HandleErrorAction {
  type: typeof HANDLE_ERROR
  error: unknown
}

export function handleError(error: unknown): HandleErrorAction {
  return { type: HANDLE_ERROR, error }
}
