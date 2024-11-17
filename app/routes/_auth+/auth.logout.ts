import type { ActionFunctionArgs } from '@remix-run/cloudflare'

import { Auth } from '~/services/auth/auth.server'

export async function action({ context, request }: ActionFunctionArgs) {
  await new Auth(context).authenticator.logout(request, {
    redirectTo: '/login',
  })
}
