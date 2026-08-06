import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AxiosError } from 'axios'
import type { ErrorResponse } from '@/api/types'

interface QueryFeedbackProps {
  loading: boolean
  error: unknown
  onRetry: () => void
}

export function QueryFeedback({ loading, error, onRetry }: QueryFeedbackProps) {
  if (loading) {
    return <Alert className="border-slate-200 bg-white text-slate-600">Loading data...</Alert>
  }

  if (!error) {
    return null
  }

  let message = 'Unable to load data for this section.'
  const axiosError = error instanceof AxiosError ? error : null
  const status = axiosError?.response?.status
  const responseMessage = (axiosError?.response?.data as ErrorResponse | undefined)?.message
  if (status === 403) {
    message = 'You are not allowed to access this section.'
  } else if (responseMessage) {
    message = responseMessage
  } else if (error instanceof Error && error.message) {
    message = error.message
  }

  return (
    <Alert className="flex items-center justify-between gap-3 border-red-200 bg-red-50 text-red-700">
      <span>{message}</span>
      <Button variant="outline" onClick={onRetry}>
        Retry
      </Button>
    </Alert>
  )
}
