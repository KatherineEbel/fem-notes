import { NavLink } from '@remix-run/react'
import { clsx } from 'clsx'
import { AiOutlineSearch } from 'react-icons/ai'
import { FiSettings } from 'react-icons/fi'

export default function TopNav() {
  return (
    <div className="navbar hidden lg:flex">
      <h1 className="btn btn-ghost text-xl">All Notes</h1>
      <div className="ml-auto flex items-center gap-4">
        <label className="input input-bordered flex items-center gap-2">
          <AiOutlineSearch className="h-4 w-4 text-current" />
          <input
            type="text"
            className="grow"
            placeholder="Search by title, content, or tags…"
          />
        </label>
        <nav className="menu">
          <ul>
            <li>
              <NavLink to="/settings" className="justify-between">
                {({ isActive }) => (
                  <>
                    <FiSettings
                      className={clsx(
                        isActive ? 'stroke-primary' : 'stroke-current',
                        'h-5 w-auto',
                      )}
                    />
                    <span className="sr-only">Settings</span>
                  </>
                )}
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}
