import { ActionFunctionArgs } from '@remix-run/cloudflare'
import { redirect } from '@remix-run/react'

import { authenticator } from '~/auth.server'

export const loader = () => redirect('/login')

export async function action({ context, request }: ActionFunctionArgs) {
  return authenticator.authenticate('google', request, {
    successRedirect: '/notes',
    failureRedirect: '/login',
    context,
  })
}
