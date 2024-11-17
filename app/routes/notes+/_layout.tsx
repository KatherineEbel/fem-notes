import { LoaderFunctionArgs } from '@remix-run/cloudflare'
import { Outlet } from '@remix-run/react'

import { Auth } from '~/services/auth/auth.server'

export async function loader({ context, request }: LoaderFunctionArgs) {
  return await new Auth(context).authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  })
}

export default function NotesLayout() {
  return (
    <div>
      <Outlet />
    </div>
  )
}
