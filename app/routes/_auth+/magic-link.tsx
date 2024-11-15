import { LoaderFunctionArgs } from '@remix-run/cloudflare'

import { authenticator } from '~/auth.server'

export async function loader({request, context}: LoaderFunctionArgs) {
  return authenticator.authenticate('TOTP', request, {
    successRedirect: '/reset-password',
    failureRedirect: '/login',
    context,
  })
}
