import { render } from '@react-email/components'
import React from 'react'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

type ReactEmailOptions = {
  to: string
  subject: string
  react: React.ReactElement
}

export async function sendAuthEmail({ to, subject, react }: ReactEmailOptions) {
  const from = process.env.SUPPORT_EMAIL

  const renderedEmail = await renderReactEmail(react)
  const email = {
    from,
    to,
    subject,
    react,
    ...renderedEmail
  }

  const { data, error } = await resend.emails.send(email)

  if (error) {
    return {
      status: 'error',
      error: error.message
    } as const
  }

  if (data) {
    return {
      status: 'success',
      data,
    } as const
  }
}

async function renderReactEmail(react: React.ReactElement) {
  const [html, text] = await Promise.all([
    render(react),
    render(react, { plainText: true }),
  ])
  return { html, text }
}
