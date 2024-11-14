import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { ActionFunctionArgs } from '@remix-run/cloudflare'
import { Form, Link, useActionData, useNavigation } from '@remix-run/react'
import React from 'react'
import { AiOutlineGoogle } from 'react-icons/ai'
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi'

import { authenticator } from '~/auth.server'
import Logo from '~/components/Logo'
import { authSchema } from '~/validation/user-validation'

export async function action({ context, request }: ActionFunctionArgs) {
  return await authenticator.authenticate('user-pass', request, {
    successRedirect: '/notes',
    failureRedirect: '/login',
    context,
  })
}

export default function Login() {
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
      <div className="card-body w-full items-center text-center">
        <Logo />
        <h1 className="h1 card-title">Welcome to Note</h1>
        <p className="text-sm text-neutral-content">
          Please log in to continue
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
          </label>
          <button
            name="intent"
            value="login"
            className="btn btn-primary my-4 w-full"
          >
            Login
          </button>
        </Form>
        <div className="divider my-0 w-full" />
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Or log in with:
        </p>
        <Form action="/auth/google" method="POST" className="w-full">
          <button className="btn btn-outline w-full">
            <AiOutlineGoogle className="mr-4 h-5 w-5" />
            Google
          </button>
        </Form>
        <div className="divider my-0 w-full" />
        <p className="text-sm text-neutral-600">
          No account yet?{' '}
          <Link to="/signup" className="text-base-content">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}
