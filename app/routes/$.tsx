/* This is called a "splat route" and as it's in the root `/app/routes/`
// directory, it's a catchall. If no other routes match, this one will and we
// can know that the user is hitting a URL that doesn't exist. By throwing a
// 404 from the loader, we can force the error boundary to render which will
// ensure the user gets the right status code and we can display a nicer error
// message for them than the Remix and/or browser default.
*/

import { Link, useLocation } from '@remix-run/react'
import { TbArrowBigLeft } from 'react-icons/tb'

import GeneralErrorBoundary from '~/components/error-boundary'

export async function loader() {
  throw new Response('Not found', { status: 404 })
}

export default function NotFound() {
  // due to the loader, this component will never be rendered, but we'll return
  // the error boundary just in case.
  return <ErrorBoundary />
}

export function ErrorBoundary() {
  const location = useLocation()
  return (
    <GeneralErrorBoundary
      statusHandlers={{
        404: () => (
          <div className="flex min-h-svh w-full flex-col items-center justify-center bg-base-200 text-base-content">
            <div className="mb-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-48 w-48 text-primary"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
            </div>

            {/* Heading */}
            <h1 className="mb-4 text-5xl font-bold">404 - Page Not Found</h1>
            <p className="mb-6 text-center text-lg">
              Oops! We couldn&apos;t find the page at:
            </p>
            <pre className="max-w-lg whitespace-pre-wrap break-words rounded-lg bg-neutral p-4 text-sm text-neutral-content shadow-md">
              {location.pathname}
            </pre>

            <Link
              to="/"
              className="btn btn-primary btn-lg mt-6 flex items-center gap-2"
            >
              <TbArrowBigLeft className="h-6 w-6" />
              Back to Home
            </Link>
          </div>
        ),
      }}
    />
  )
}
