import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/cloudflare'
import { Form, redirect, useActionData } from '@remix-run/react'
import React from 'react'
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi'
import { LuInfo } from 'react-icons/lu'
import { z } from 'zod'

import Logo from '~/components/Logo'
import { Auth } from '~/services/auth/auth.server'
import { AuthUser } from '~/services/auth/utils'

const restPasswordSchema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password and Confirm password must match',
        path: ['confirmPassword'],
      })
      return
    }
  })

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData()
  const submission = parseWithZod(formData, { schema: restPasswordSchema })
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
  return new Auth(context).authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  })
}

export default function ResetPassword() {
  const lastResult = useActionData<typeof action>()
  const [form, { password, confirmPassword }] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: restPasswordSchema })
    },
    shouldRevalidate: 'onInput',
    shouldValidate: 'onBlur',
  })
  const [showPassword, setShowPassword] = React.useState(false)

  return (
    <div className="card w-full text-base-content shadow-md md:max-w-xl dark:bg-base-100">
      <div className="card-body w-full items-center p-4 text-center md:p-12">
        <Logo />
        <h1 className="h1 card-title mt-4">Reset your password</h1>
        <p className="text-sm text-neutral-content">
          Choose a new password to secure you account
        </p>

        <Form method="POST" {...getFormProps(form)} className="mt-4 w-full">
          <label htmlFor={password.id} className="form-control w-full">
            <div className="label">
              <span className="label-text">New Password</span>
            </div>
            <div className="relative">
              <input
                {...getInputProps(password, {
                  type: showPassword ? 'text' : 'password',
                })}
                className="input input-bordered w-full"
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className="sr-only">
                  {showPassword ? 'Hide' : 'Show'} Password
                </span>
                {!showPassword ? (
                  <HiOutlineEye className="h-5 w-auto text-neutral-500 dark:text-neutral-400" />
                ) : null}
                {showPassword ? (
                  <HiOutlineEyeOff className="h-5 w-auto text-neutral-500 dark:text-neutral-400" />
                ) : null}
              </button>
            </div>
            {password.errors ? (
              <div className="label">
                <span className="label-text-alt text-xs text-error">
                  {password.errors.join(', ')}
                </span>
              </div>
            ) : (
              <div className="label text-neutral-600">
                <div className="label-text-alt flex items-center gap-1 text-neutral-600 dark:text-neutral-300">
                  <LuInfo />
                  <span>At least 8 characters</span>
                </div>
              </div>
            )}
          </label>

          <label htmlFor={confirmPassword.id} className="form-control w-full">
            <div className="label">
              <span className="label-text">New Password</span>
            </div>
            <div className="relative">
              <input
                {...getInputProps(confirmPassword, {
                  type: showPassword ? 'text' : 'password',
                })}
                className="input input-bordered w-full"
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className="sr-only">
                  {showPassword ? 'Hide' : 'Show'} Password
                </span>
                {!showPassword ? (
                  <HiOutlineEye className="h-5 w-auto text-neutral-500 dark:text-neutral-400" />
                ) : null}
                {showPassword ? (
                  <HiOutlineEyeOff className="h-5 w-auto text-neutral-500 dark:text-neutral-400" />
                ) : null}
              </button>
            </div>
            {confirmPassword.errors ? (
              <div className="label">
                <span className="label-text-alt text-xs text-error">
                  {confirmPassword.errors.join(', ')}
                </span>
              </div>
            ) : (
              <div className="label text-neutral-600">
                <div className="label-text-alt flex items-center gap-1 text-neutral-600 dark:text-neutral-300">
                  <LuInfo />
                  <span>At least 8 characters</span>
                </div>
              </div>
            )}
          </label>

          <button className="btn btn-primary mt-2 w-full">
            Reset Password
          </button>
        </Form>
      </div>
    </div>
  )
}
