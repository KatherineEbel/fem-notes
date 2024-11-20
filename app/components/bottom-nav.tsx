import { NavLink } from '@remix-run/react'
import {
  AiOutlineHome,
  AiOutlineInbox,
  AiOutlineSearch,
  AiOutlineTag,
} from 'react-icons/ai'

export default function BottomNav() {
  return (
    <div className="btm-nav btm-nav-lg lg:hidden">
      <NavLink
        to="/notes"
        className="flex flex-col items-center gap-y-1 text-primary"
      >
        <AiOutlineHome className="h-5 w-5 stroke-current" />
        <span className="sr-only md:not-sr-only">Home</span>
      </NavLink>
      <NavLink
        to="/notes/search"
        className="flex flex-col items-center gap-y-1 text-primary"
      >
        <AiOutlineSearch className="h-5 w-5 stroke-current" />
        <span className="sr-only md:not-sr-only">Search</span>
      </NavLink>
      <NavLink
        to="/notes/archived"
        className="flex flex-col items-center gap-y-1 text-primary"
      >
        <AiOutlineInbox className="h-5 w-5 stroke-current" />
        <span className="sr-only md:not-sr-only">Archived</span>
      </NavLink>

      <NavLink
        to="/notes/tags"
        className="flex flex-col items-center gap-y-1 text-primary"
      >
        <AiOutlineTag className="h-5 w-5 stroke-current" />
        <span className="sr-only md:not-sr-only">Tags</span>
      </NavLink>

      <NavLink
        to="/notes/settings"
        className="flex flex-col items-center gap-y-1 text-primary"
      >
        <AiOutlineTag className="h-5 w-5 stroke-current" />
        <span className="sr-only md:not-sr-only">Settings</span>
      </NavLink>
    </div>
  )
}
