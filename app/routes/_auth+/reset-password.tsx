import { getFormProps, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/cloudflare'
import { Form, redirect, useActionData } from '@remix-run/react'
import React from 'react'

import Logo from '~/components/Logo'
import PasswordField from '~/components/ui/password-field'
import { Auth } from '~/services/auth/auth.server'
import { AuthUser } from '~/services/auth/utils'
import { resetPasswordSchema as schema } from '~/validation/user-validation'

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData()
  const submission = parseWithZod(formData, { schema })
  if (submission.status !== 'success') {
    return submission.reply()
  }

  const authenticator = new Auth(context)
  const session = await authenticator.sessionStorage.getSession(
    request.headers.get('cookie'),
  )
  try {
    const user = (await session.get(authenticator.sessionKey)) as AuthUser
    await Auth.resetPassword(context, user.email, submission.value.password)
    return redirect('/notes')
  } catch (e) {
    console.error(e)
    return submission.reply({
      formErrors: ['Sorry, something went wrong, please try again later.'],
    })
  }
}

export async function loader({ context, request }: LoaderFunctionArgs) {
  return new Auth(context).isAuthenticated(request, {
    failureRedirect: '/login',
  })
}

export default function ResetPassword() {
  const lastResult = useActionData<typeof action>()
  const [form, { password, confirmPassword }] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema })
    },
    shouldRevalidate: 'onInput',
    shouldValidate: 'onBlur',
  })

  return (
    <div className="card w-full text-base-content shadow-md md:max-w-xl dark:bg-base-100">
      <div className="card-body w-full items-center p-4 text-center md:p-12">
        <Logo />
        <h1 className="h1 card-title mt-4">Reset your password</h1>
        <p className="text-sm text-neutral-content">
          Choose a new password to secure you account
        </p>

        <Form method="POST" {...getFormProps(form)} className="mt-4 w-full">
          <PasswordField label="Password" meta={password} />
          <PasswordField label="New Password" meta={confirmPassword} />
          <button className="btn btn-primary mt-2 w-full">
            Reset Password
          </button>
        </Form>
      </div>
    </div>
  )
}
