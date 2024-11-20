import { NavLink, Outlet, useMatches, useParams } from '@remix-run/react'

export default function NotesLayout() {
  const matches = useMatches()
  const params = useParams()
  const isArchived = matches.some((m) =>
    m.id.startsWith('routes/_app+/notes+/archived'),
  )
  const tag = params.tag

  const basePath = isArchived
    ? '/notes/archived'
    : tag
      ? `/notes/tagged/${tag}`
      : '/notes'

  return (
    <div className="container flex h-full min-h-[400px] px-0 pb-12 md:px-8">
      <div className="bg-muted grid w-full grid-cols-4 pl-2 md:container md:rounded-3xl md:pr-0">
        <nav className="col-span-1">
          <NavLink to={`${basePath}/new`}>Create New Note</NavLink>
          <ul>
            <li>
              <NavLink to={`${basePath}/note-1`}>Note 1</NavLink>
            </li>
          </ul>
        </nav>
        <div className="col-span-1">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
