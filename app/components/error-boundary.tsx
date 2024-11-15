import {
  type ErrorResponse,
  isRouteErrorResponse,
  useParams,
  useRouteError,
} from '@remix-run/react'
import React from 'react'

type StatusHandler = (info: {
  error: ErrorResponse
  params: Record<string, string | undefined>
}) => React.ReactNode | null

export default function GeneralErrorBoundary({
  defaultStatusHandler = ({ error }) => (
    <p>
      {error.status} {error.data}
    </p>
  ),
  statusHandlers,
  unexpectedErrorHandler = (error) => <p>{getErrorMessage(error)}</p>,
}: {
  defaultStatusHandler?: StatusHandler
  statusHandlers?: Record<number, StatusHandler>
  unexpectedErrorHandler?: (error: unknown) => JSX.Element | null
}) {
  const error = useRouteError()
  const params = useParams()

  if (typeof document !== 'undefined') {
    console.error(error)
  }

  return (
    <>
      {isRouteErrorResponse(error)
        ? (statusHandlers?.[error.status] ?? defaultStatusHandler)({
            error,
            params,
          })
        : unexpectedErrorHandler(error)}
    </>
  )
}

function getErrorMessage(error: unknown) {
  if (typeof error === 'string') return error
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message
  }
  console.error('Unable to get error message for error', error)
  return 'Unknown Error'
}
