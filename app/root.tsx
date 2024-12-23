import { data, LinksFunction, LoaderFunctionArgs } from '@remix-run/cloudflare'
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react'
import React from 'react'
import { ToastContainer, toast as notify, Flip } from 'react-toastify'
import toastStyles from 'react-toastify/dist/ReactToastify.css?url'
import { PreventFlashOnWrongTheme, ThemeProvider, useTheme } from 'remix-themes'
import { getToast } from 'remix-toast'

import GeneralErrorBoundary from '~/components/error-boundary'
import { themeSessionResolver } from '~/services/sessions.server'

import styles from '../styles/tailwind.css?url'

export const links: LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Noto+Serif:ital,wght@0,100..900;1,100..900&family=Source+Code+Pro:ital,wght@0,200..900;1,200..900&display=swap',
  },
  { rel: 'stylesheet', href: toastStyles },
  {
    rel: 'stylesheet',
    href: styles,
  },
]

export async function loader({ request }: LoaderFunctionArgs) {
  const { getTheme } = await themeSessionResolver(request)
  const { toast, headers } = await getToast(request)
  return data({ toast, theme: getTheme() }, { headers })
}

export default function AppWithProviders() {
  const data = useLoaderData<typeof loader>()

  React.useEffect(() => {
    if (data.toast) {
      notify(data.toast.message, { type: data.toast.type })
    }
  }, [data.toast])
  return (
    <ThemeProvider specifiedTheme={data.theme} themeAction="/action/set-theme">
      <App />
    </ThemeProvider>
  )
}

export function App() {
  const data = useLoaderData<typeof loader>()
  const [theme] = useTheme()

  return (
    <html lang="en" data-theme={theme ?? ''}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <PreventFlashOnWrongTheme ssrTheme={Boolean(data.theme)} />
        <Links />
      </head>
      <body className="bg-base-300 font-sans text-base-content">
        <Outlet />
        <ToastContainer
          position="top-center"
          transition={Flip}
          theme={data.theme ?? ''}
        />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export const ErrorBoundary = GeneralErrorBoundary
