import { LoaderFunctionArgs } from '@remix-run/cloudflare'
import { Outlet } from '@remix-run/react'
import { redirectWithWarning } from 'remix-toast'

import { Auth } from '~/services/auth/auth.server'

export async function loader({ context, request }: LoaderFunctionArgs) {
  const auth = new Auth(context)
  const user = await auth.isAuthenticated(request)
  if (!user) {
    return redirectWithWarning('/login', 'You must be logged in to view notes.')
  }
  return { user }
}

export default function NotesLayout() {
  return (
    <div>
      <Outlet />
    </div>
  )
}
