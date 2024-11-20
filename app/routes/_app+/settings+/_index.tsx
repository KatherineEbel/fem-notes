import { redirect } from '@remix-run/react'

export async function loader() {
  return redirect('color-themes')
}
export default function SettingsRoute() {
  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className="skeleton h-full w-full"></div>
    </div>
  )
}
