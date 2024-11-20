import type { MetaFunction } from '@remix-run/cloudflare'
import { Link } from '@remix-run/react'

import Logo from '~/components/Logo'

export const meta: MetaFunction = () => {
  return [{ title: 'Notes' }, { name: 'description', content: 'Notes App' }]
}

export default function Index() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Logo size="lg" />
      <h1 className="mt-4 text-4xl font-bold">Welcome to Your Notes App</h1>
      <p className="mt-2 text-lg text-neutral-500">
        Capture, organize, and share your notes effortlessly
      </p>
      <div className="mt-8 flex space-x-4">
        <Link to="/signup" className="btn btn-primary px-6 py-3">
          Get Started
        </Link>
      </div>
    </div>
  )
}
