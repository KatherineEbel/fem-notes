import { NavLink, useLocation, useMatches } from '@remix-run/react'
import { clsx } from 'clsx'
import { AiOutlineHome, AiOutlineTag } from 'react-icons/ai'
import { LuChevronRight } from 'react-icons/lu'
import { MdOutlineArchive } from 'react-icons/md'

import Logo from '~/components/Logo'
import HomeIconNavLink from '~/components/ui/home-icon-nav-link'
import IconNavLink from '~/components/ui/icon-nav-link'

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

export default function SideNav() {
  return (
    <nav className="menu min-h-full w-72 bg-base-200 p-4 text-base-content">
      <div className="flex w-full place-items-center">
        <Logo />
      </div>
      <ul className="mt-8">
        <li>
          <HomeIconNavLink />
        </li>
        <li>
          <NavLink className="flex items-center gap-2" to="/notes/archived">
            {({ isActive }) => (
              <>
                <MdOutlineArchive
                  className={clsx(
                    'h-5 w-5',
                    isActive ? 'fill-primary' : 'fill-current',
                  )}
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
            <IconNavLink
              label={t}
              to={`/notes/tagged/${t}`}
              key={t}
              icon={AiOutlineTag}
            />
          </li>
        ))}
      </ul>
    </nav>
  )
}
