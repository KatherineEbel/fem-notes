import { Form } from '@remix-run/react'
import { AiOutlineFontSize } from 'react-icons/ai'
import { MdOutlineDarkMode, MdOutlineLightMode } from 'react-icons/md'
import { RiLockPasswordLine } from 'react-icons/ri'
import { useTheme } from 'remix-themes'

import IconNavLink from '~/components/ui/icon-nav-link'

export default function SettingsNav() {
  const [theme] = useTheme()

  return (
    <nav className="menu mr-2 border-r border-r-base-100 pl-4 pr-4">
      <ul>
        <li>
          <IconNavLink
            to="color-themes"
            label="Color Theme"
            icon={theme === 'light' ? MdOutlineDarkMode : MdOutlineLightMode}
          />
        </li>
        <li>
          <IconNavLink
            to="font-themes"
            label="Font Theme"
            icon={AiOutlineFontSize}
          />
        </li>

        <li>
          <IconNavLink
            label="Change Password"
            to="change-password"
            icon={RiLockPasswordLine}
          />
        </li>
      </ul>

      <div className="divider" />
      <Form method="POST" action="/auth/logout" className="m-0 px-4 py-0">
        <button className="btn-nav-sm btn btn-ghost btn-block h-0 justify-start px-0 py-0 font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              className="stroke-current"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              d="M21 11.998H8.945m12.055 0-2.932-2.934M21 11.998l-2.932 2.936M14.556 8.266V7.251c0-1.56-1.121-2.891-2.651-3.15L6.702 3.046C4.765 2.718 3 4.219 3 6.195v11.61c0 1.976 1.765 3.477 3.702 3.15l5.203-1.057a3.188 3.188 0 0 0 2.65-3.149v-1.014"
            />
          </svg>
          Logout
        </button>
      </Form>
    </nav>
  )
}
