import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { ActionFunctionArgs } from '@remix-run/cloudflare'
import { Form, useActionData, useNavigation } from '@remix-run/react'

import { authenticator } from '~/auth.server'
import Logo from '~/components/Logo'
import { forgotPasswordForm } from '~/validation/user-validation'

export async function action({ context, request }: ActionFunctionArgs) {
  return authenticator.authenticate('TOTP', request, {
    successRedirect: '/verify',
    failureRedirect: '/forgot-password',
    context,
  })
}

export default function ForgotPassword() {
  const lastResult = useActionData<typeof action>()
  const navigation = useNavigation()
  const [form, { email }] = useForm({
    lastResult: navigation.state === 'idle' ? lastResult : null,
    onValidate({ formData }) {
      const result = parseWithZod(formData, { schema: forgotPasswordForm })
      console.log('validation result', result)
      return result
    },
    shouldRevalidate: 'onInput',
    shouldValidate: 'onSubmit',
  })

  return (
    <div className="card w-full text-base-content shadow-md md:max-w-xl dark:bg-base-100">
      <div className="card-body w-full items-center p-4 text-center md:p-12">
        <Logo />
        <h1 className="h1 card-title mt-4">Forgotten your password?</h1>
        <p className="text-sm text-neutral-content">
          Enter you email below, and we&apos;ll send you a link to reset it.
        </p>

        <Form method="POST" {...getFormProps(form)} className="mt-4 w-full">
          <label htmlFor={email.id} className="form-control w-full">
            <div className="label">
              <span className="label-text">Email Address</span>
            </div>
            <input
              {...getInputProps(email, { type: 'email' })}
              placeholder="email@example.com"
              className="input input-bordered w-full"
            />
            {email.errors ? (
              <div className="label">
                <span className="label-text-alt text-xs text-error">
                  {email.errors.join(', ')}
                </span>
              </div>
            ) : null}
          </label>

          <button className="btn btn-primary mt-2 w-full">
            Send Reset Link
          </button>
        </Form>
      </div>
    </div>
  )
}
