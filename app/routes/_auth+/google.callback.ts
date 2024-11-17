import { type LoaderFunctionArgs } from '@remix-run/cloudflare'

import { Auth } from '~/services/auth/auth.server'

export const loader = ({ context, request }: LoaderFunctionArgs) => {
  return new Auth(context).authenticator.authenticate('google', request, {
    successRedirect: '/notes',
    failureRedirect: '/login',
    context,
  })
}
