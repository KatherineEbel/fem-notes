import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { ActionFunctionArgs } from '@remix-run/cloudflare'
import { Form, Link, useActionData, useNavigation } from '@remix-run/react'
import React from 'react'
import { AiOutlineGoogle } from 'react-icons/ai'
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi'
import { LuInfo } from 'react-icons/lu'

import { authenticator } from '~/auth.server'
import Logo from '~/components/Logo'
import { authSchema } from '~/validation/user-validation'

export async function action({ context, request }: ActionFunctionArgs) {
  console.log('signup action')
  return await authenticator.authenticate('user-pass', request, {
    successRedirect: '/login',
    failureRedirect: '/signup',
    context,
  })
}

export default function Signup() {
  const navigation = useNavigation()
  const lastResult = useActionData<typeof action>()
  const id = React.useId()
  const [form, { email, password }] = useForm({
    lastResult: navigation.state === 'idle' ? lastResult : null,
    id,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: authSchema })
    },
    shouldRevalidate: 'onInput',
    shouldValidate: 'onBlur',
  })
  const [showPassword, setShowPassword] = React.useState(false)
  return (
    <div className="card w-full text-base-content shadow-md md:max-w-xl dark:bg-base-100">
      <div className="card-body w-full items-center p-4 text-center md:p-12">
        <Logo />
        <h1 className="h1 card-title">Create your account</h1>
        <p className="text-sm text-neutral-content">
          Sign up to start organizing your notes and boost your productivity.
        </p>

        {form.errors ? (
          <p className="label-text text-sm text-error">
            {form.errors.join(', ')}
          </p>
        ) : null}

        <Form
          className="flex w-full flex-1 flex-col"
          method="POST"
          {...getFormProps(form)}
        >
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

          <label htmlFor={password.id} className="form-control w-full">
            <div className="label">
              <span className="label-text">Password</span>
              <Link to="/forgot-password" className="label-text-alt underline">
                Forgot
              </Link>
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
          <button
            name="intent"
            value="signup"
            className="btn btn-primary mt-2 w-full"
          >
            Sign up
          </button>
        </Form>
        <div className="divider my-0 w-full" />
        <p className="text-neutral-500">Or log in with:</p>
        <Form action="/auth/google" method="POST" className="w-full">
          <button className="btn btn-outline w-full">
            <AiOutlineGoogle className="mr-4 h-4 fill-current" />
            Google
          </button>
        </Form>
        <div className="divider my-0 w-full" />
        <p>
          Already have an account?{' '}
          <Link className="text-base-content" to="/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}
