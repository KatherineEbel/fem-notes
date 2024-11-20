import { data, LoaderFunctionArgs } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'

export async function loader({ params }: LoaderFunctionArgs) {
  const { tag } = params
  return data({ tag })
}
export default function TaggedNotesView() {
  const { tag } = useLoaderData<typeof loader>()
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">Viewing {tag} notes</h1>
    </div>
  )
}
