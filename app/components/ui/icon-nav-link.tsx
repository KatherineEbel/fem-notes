import { NavLink, NavLinkProps } from '@remix-run/react'
import { clsx } from 'clsx'
import React from 'react'
import { IconBaseProps } from 'react-icons'
import { LuChevronRight } from 'react-icons/lu'

type IconNavLinkProps = NavLinkProps & {
  label: string
  to: string
  icon: (props: IconBaseProps) => React.ReactNode
}

export default function IconNavLink({
  icon: Icon,
  label,
  to,
}: IconNavLinkProps) {
  const rotateClassName = Icon.name.includes('Tag') ? '-rotate-90' : ''

  return (
    <NavLink
      className="flex items-center gap-2 text-nowrap rounded-md font-medium"
      to={to}
    >
      {({ isActive }) => (
        <>
          <Icon
            className={clsx(
              'h-5 w-5',
              rotateClassName,
              isActive ? 'fill-primary' : 'fill-current',
            )}
          />
          {label}
          {isActive ? <LuChevronRight className="ml-auto" /> : null}
        </>
      )}
    </NavLink>
  )
}
