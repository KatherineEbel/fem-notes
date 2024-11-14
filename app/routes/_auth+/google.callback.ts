import { type LoaderFunctionArgs } from '@remix-run/cloudflare'

import { authenticator } from '~/auth.server'

export const loader = ({ context, request }: LoaderFunctionArgs) => {
  return authenticator.authenticate('google', request, {
    successRedirect: '/notes',
    failureRedirect: '/login',
    context,
  })
}
