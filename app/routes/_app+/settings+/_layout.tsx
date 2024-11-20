import { Outlet, useMatches } from '@remix-run/react'

import SettingsNav from '~/routes/_app+/settings+/__settings-nav'

export default function NotesLayout() {
  return (
    <div className="container flex h-full py-5">
      <div className="flex gap-x-2 md:container">
        <SettingsNav />
        <div className="flex-1 justify-start">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
