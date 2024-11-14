import { LoaderFunctionArgs } from '@remix-run/cloudflare'
import { Outlet } from '@remix-run/react'

import { authenticator } from '~/auth.server'

export async function loader({request}: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  })
  console.log(user)
  return user
}

export default function NotesLayout() {
  return (
      <div>
        <Outlet/>
      </div>
  )
}
