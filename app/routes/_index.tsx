import type { MetaFunction } from '@remix-run/cloudflare'

export const meta: MetaFunction = () => {
  return [{ title: 'Notes' }, { name: 'description', content: 'Notes App' }]
}

export default function Index() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <h1 className="font-serif font-semibold">This is Noto Serif</h1>
      <h1 className="font-mono">This is Source Code Pro</h1>
      <h1>This is Inter</h1>
      <button className="btn btn-primary">Daisy UI</button>
    </div>
  )
}
