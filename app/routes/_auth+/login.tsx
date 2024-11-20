import {
  getFormProps,
  getInputProps,
  SubmissionResult,
  useForm,
} from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { ActionFunctionArgs } from '@remix-run/cloudflare'
import { Form, Link, useActionData, useNavigation } from '@remix-run/react'
import { clsx } from 'clsx'
import React from 'react'
import { AiOutlineGoogle } from 'react-icons/ai'
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi'
import { AuthorizationError } from 'remix-auth'
import { redirectWithError } from 'remix-toast'

import Logo from '~/components/Logo'
import InputField from '~/components/ui/input-field'
import PasswordField from '~/components/ui/password-field'
import SubmitButton from '~/components/ui/submit-button'
import { Auth } from '~/services/auth/auth.server'
import { authSchema } from '~/validation/user-validation'

export async function loader({ context, request }: ActionFunctionArgs) {
  const auth = new Auth(context)
  return await auth.isAuthenticated(request, {
    successRedirect: '/notes',
  })
}

export async function action({ context, request }: ActionFunctionArgs) {
  try {
    return await new Auth(context).authenticate('user-pass', request, {
      successRedirect: '/notes',
    })
  } catch (e) {
    if (e instanceof Response) return e
    if (e instanceof AuthorizationError) {
      return redirectWithError('/login', e.message)
    }
  }
}

export default function Login() {
  const navigation = useNavigation()
  const lastResult = useActionData<typeof action>()
  const id = React.useId()
  const [form, { email, password }] = useForm({
    lastResult:
      navigation.state === 'idle'
        ? (lastResult as unknown as SubmissionResult)
        : null,
    id,
    onValidate({ formData }) {
      const result = parseWithZod(formData, { schema: authSchema })
      console.log(result)
      return result
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

        <Form
          className="flex w-full flex-1 flex-col"
          method="POST"
          {...getFormProps(form)}
        >
          <InputField
            meta={email}
            label="Email Address"
            placeholder="email@example.com"
          />

          {/* TODO: make password field more customizable */}
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
                className={clsx(
                  'input input-bordered w-full',
                  password.errors && 'input-error',
                )}
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
            ) : null}
          </label>
          <SubmitButton
            name="intent"
            value="login"
            loading={
              navigation.state !== 'idle' &&
              navigation.formAction?.includes('/login')
            }
          >
            Login
          </SubmitButton>
        </Form>
        <div className="divider my-0 w-full" />
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Or log in with:
        </p>
        <Form action="/auth/google" method="POST" className="w-full">
          <SubmitButton
            className="btn-outline"
            loading={
              navigation.state !== 'idle' &&
              navigation.formAction?.includes('google')
            }
          >
            <AiOutlineGoogle className="mr-4 h-5 w-5" />
            Google
          </SubmitButton>
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
