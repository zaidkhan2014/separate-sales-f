export type QueryParamValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Array<string | number | boolean>

/**
 * Remove undefined/null/blank-string values from query params.
 * Keeps false and 0, and keeps arrays with at least one item.
 */
export function cleanQueryParams<T extends object>(params: T): Record<string, QueryParamValue> {
  return Object.fromEntries(
    Object.entries(params as Record<string, QueryParamValue>).filter(([, value]) => {
      if (value === undefined || value === null) {
        return false
      }
      if (typeof value === 'string') {
        return value.trim().length > 0
      }
      if (Array.isArray(value)) {
        return value.length > 0
      }
      return true
    }),
  )
}
