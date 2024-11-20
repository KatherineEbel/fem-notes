import { NavLink, NavLinkProps, useMatches } from '@remix-run/react'
import { clsx } from 'clsx'
import { AiOutlineHome } from 'react-icons/ai'
import { LuChevronRight } from 'react-icons/lu'

const homeRouteIds = [
  'routes/_app+/notes+/$noteId',
  'routes/_app+/notes+/_index',
  'routes/_app+/notes+/new',
]

export default function HomeIconNavLink() {
  const matches = useMatches()
  const routeIds = matches.map((m) => m.id)
  const isHomeRoute = routeIds.some((id) => homeRouteIds.includes(id))

  console.dir(routeIds)

  return (
    <NavLink
      className={({ isActive }) => {
        return clsx(
          'flex items-center gap-2 text-nowrap rounded-md font-medium',
          isActive && isHomeRoute ? 'active' : '',
        )
      }}
      to="/notes"
    >
      {({ isActive }) => (
        <>
          <AiOutlineHome
            className={clsx(
              'h-5 w-5',
              isActive && isHomeRoute ? 'fill-primary' : 'fill-current',
            )}
          />
          All Notes
          {isActive && isHomeRoute ? (
            <LuChevronRight className="ml-auto" />
          ) : null}
        </>
      )}
    </NavLink>
  )
}
