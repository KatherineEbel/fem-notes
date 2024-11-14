import { Outlet } from '@remix-run/react'

export default function AuthLayout() {
  return (
    <main className="grid min-h-svh place-items-center p-4 md:p-8">
      <Outlet />
    </main>
  )
}
