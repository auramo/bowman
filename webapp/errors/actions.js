export const HANDLE_ERROR = 'errors/HANDLE_ERROR'

export function handleError(error) {
  return { type: HANDLE_ERROR, error }
}
