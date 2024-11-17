import { render } from '@react-email/components'
import { AppLoadContext } from '@remix-run/cloudflare'
import React from 'react'
import { Resend } from 'resend'

type ReactEmailOptions = {
  to: string
  subject: string
  react: React.ReactElement
}

export interface EmailClient {
  emails: Resend['emails']
}

export class EmailService {
  private readonly client: EmailClient
  private readonly supportEmail: string

  constructor(context: AppLoadContext, client?: EmailClient) {
    this.client = client ?? new Resend(context.env.RESEND_API_KEY)
    this.supportEmail = context.env.SUPPORT_EMAIL
  }

  async sendAuthEmail({ to, subject, react }: ReactEmailOptions) {
    const renderedEmail = await EmailService.renderReactEmail(react)
    const email = {
      from: this.supportEmail,
      to,
      subject,
      react,
      ...renderedEmail,
    }

    const { data, error } = await this.client.emails.send(email)

    if (error) {
      return {
        status: 'error',
        error: error.message,
      } as const
    }

    if (data) {
      return {
        status: 'success',
        data,
      } as const
    }
  }

  private static async renderReactEmail(react: React.ReactElement) {
    const [html, text] = await Promise.all([
      render(react),
      render(react, { plainText: true }),
    ])
    return { html, text }
  }
}
