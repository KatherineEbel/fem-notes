import { ActionFunctionArgs } from '@remix-run/cloudflare'
import { redirect } from '@remix-run/react'

import { Auth } from '~/services/auth/auth.server'

export const loader = () => redirect('/login')

export async function action({ context, request }: ActionFunctionArgs) {
  return new Auth(context).authenticator.authenticate('google', request, {
    successRedirect: '/notes',
    failureRedirect: '/login',
    context,
  })
}
