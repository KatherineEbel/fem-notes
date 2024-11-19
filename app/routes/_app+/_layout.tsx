import { LoaderFunctionArgs } from '@remix-run/cloudflare'
import { Outlet } from '@remix-run/react'
import { redirectWithWarning } from 'remix-toast'

import BottomNav from '~/components/bottom-nav'
import Logo from '~/components/Logo'
import SideNav from '~/components/side-nav'
import TopNav from '~/components/top-nav'
import { Auth } from '~/services/auth/auth.server'

export async function loader({ context, request }: LoaderFunctionArgs) {
  const auth = new Auth(context)
  const user = await auth.isAuthenticated(request)
  if (!user) {
    return redirectWithWarning('/login', 'You must be logged in to view notes.')
  }
  return { user }
}

export default function AppLayout() {
  return (
    <div className="flex h-svh flex-col sm:flex-row">
      <div className="drawer lg:drawer-open">
        <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col md:pr-4">
          <div className="navbar lg:hidden">
            <h2>
              <Logo size="lg" />
            </h2>
          </div>
          <TopNav />
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
        <div className="drawer-side">
          <SideNav />
        </div>
        <BottomNav />
      </div>
    </div>
  )
}
