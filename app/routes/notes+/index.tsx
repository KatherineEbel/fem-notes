import { Form } from '@remix-run/react'

export default function NotesIndex() {
  return (
    <div className="flex place-items-center p-4">
      <h1>Your Notes</h1>
      <Form method="POST" action="/auth/logout" className="ml-auto">
        <button className="btn btn-primary">Logout</button>
      </Form>
    </div>
  )
}
