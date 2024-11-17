import { LoaderFunctionArgs } from '@remix-run/cloudflare'

import { Auth } from '~/services/auth/auth.server'

export async function loader({ request, context }: LoaderFunctionArgs) {
  return new Auth(context).authenticator.authenticate('TOTP', request, {
    successRedirect: '/reset-password',
    failureRedirect: '/login',
    context,
  })
}
