import { getFormProps, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import {
  ActionFunctionArgs,
  data,
  LoaderFunctionArgs,
} from '@remix-run/cloudflare'
import { Form, redirect, useActionData, useLoaderData } from '@remix-run/react'
import { z } from 'zod'

import { InputOTPConform } from '~/components/input-otp'
import Logo from '~/components/Logo'
import { Auth } from '~/services/auth/auth.server'

export const verifySchema = z.object({
  code: z.string().length(6),
})

export async function loader({ context, request }: LoaderFunctionArgs) {
  const auth = new Auth(context)
  await auth.isAuthenticated(request, {
    successRedirect: '/notes',
  })

  // Commit session to clear any `flash` error message.
  const sessionStorage = auth.sessionStorage
  const cookie = await sessionStorage.getSession(request.headers.get('cookie'))
  const authEmail = cookie.get('auth:totp')
  const totp = cookie.get('auth:totp')
  const authError = cookie.get('auth:error')
  if (!authEmail || !totp) return redirect('/login')
  return data({ authError, authEmail } as const, {
    headers: {
      'set-cookie': await sessionStorage.commitSession(cookie),
    },
  })
}

export async function action({ context, request }: ActionFunctionArgs) {
  const authenticator = new Auth(context)
  try {
    return await authenticator.authenticate('TOTP', request, {
      throwOnError: true,
      successRedirect: '/reset-password',
      failureRedirect: '/verify',
      context,
    })
  } catch (error) {
    console.log(error)
    return data({ authError: (error as Error).message }, { status: 400 })
  }
}

export default function Verify() {
  const { authError } = useLoaderData<typeof loader>()
  const lastResult = useActionData<typeof action>()
  const [form, { code }] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: verifySchema })
    },
  })

  return (
    <div className="card w-full text-base-content shadow-md md:max-w-xl dark:bg-base-100">
      <div className="card-body w-full items-center p-4 text-center md:p-12">
        <Logo />
        <h1 className="h1 card-title mt-4">Enter your Verification Code</h1>
        <p className="text-sm text-neutral-content">
          Please enter the verification code sent to your email address.
        </p>

        {authError ? (
          <div className="alert alert-error my-2">
            <span>{authError.message}</span>
          </div>
        ) : null}

        {lastResult?.authError ? (
          <div className="alert alert-error my-2">
            <span>{lastResult.authError}</span>
          </div>
        ) : null}
        <Form
          method="POST"
          {...getFormProps(form)}
          className="mt-4 flex w-full flex-col items-center justify-center"
        >
          <label htmlFor={code.id} className="form-control">
            <div className="label">
              <span className="sr-only">One-Time Code</span>
            </div>
            <div className="my-4">
              <InputOTPConform meta={code} length={6} />
            </div>
            {code.errors ? (
              <div className="label">
                <span className="label-text-alt text-xs text-error">
                  {code.errors.join(', ')}
                </span>
              </div>
            ) : null}
          </label>

          <button className="btn btn-primary btn-wide mt-2">Submit</button>
        </Form>
      </div>
    </div>
  )
}
