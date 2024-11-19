import { NavLink, useLocation } from '@remix-run/react'
import { clsx } from 'clsx'
import { AiOutlineHome, AiOutlineTag } from 'react-icons/ai'
import { LuChevronRight } from 'react-icons/lu'
import { MdOutlineArchive } from 'react-icons/md'

import Logo from '~/components/Logo'

const tags = [
  'Cooking',
  'Dev',
  'Fitness',
  'Health',
  'Personal',
  'React',
  'Recipes',
  'Shopping',
  'Travel',
  'Typescript',
] as const
const allNotesExcludedRoutes = [
  '/notes/archived',
  '/notes/tagged',
  '/notes/search',
] as const

export default function SideNav() {
  const { pathname } = useLocation()
  const isAllNotesRoute =
    pathname.startsWith('/notes') &&
    !allNotesExcludedRoutes.some((r) => pathname.startsWith(r))

  console.dir({ isNotesPage: isAllNotesRoute })
  return (
    <nav className="menu min-h-full w-80 bg-base-200 p-4 text-base-content">
      <div className="flex w-full place-items-center">
        <Logo />
      </div>
      <ul className="mt-8">
        <li>
          <NavLink
            className={({ isActive }) => {
              return clsx(
                'flex items-center gap-2',
                isActive && isAllNotesRoute ? 'active' : '',
              )
            }}
            to="/notes"
          >
            {({ isActive }) => (
              <>
                <AiOutlineHome
                  className={clsx(
                    isActive && isAllNotesRoute
                      ? 'fill-primary'
                      : 'fill-current',
                  )}
                />
                All Notes
                {isActive ? <LuChevronRight className="ml-auto" /> : null}
              </>
            )}
          </NavLink>
        </li>
        <li>
          <NavLink className="flex items-center gap-2" to="/notes/archived">
            {({ isActive }) => (
              <>
                <MdOutlineArchive
                  className={clsx(isActive ? 'fill-primary' : 'fill-current')}
                />
                Archived Notes
                {isActive ? <LuChevronRight className="ml-auto" /> : null}
              </>
            )}
          </NavLink>
        </li>
      </ul>

      <div className="divider"></div>

      <h2 className="text-neutral-500 dark:text-neutral-400">Tags</h2>
      <ul className="my-2">
        {tags.map((t) => (
          <li key={t}>
            <NavLink
              className="flex items-center gap-2"
              to={`/notes/tagged/${t}`}
              key={t}
            >
              {({ isActive }) => (
                <>
                  <AiOutlineTag
                    className={clsx(isActive ? 'fill-primary' : 'fill-current')}
                  />
                  {t}
                  {isActive ? <LuChevronRight className="ml-auto" /> : null}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
