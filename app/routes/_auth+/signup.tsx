import { getFormProps, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { ActionFunctionArgs } from '@remix-run/cloudflare'
import { Form, Link, useNavigation } from '@remix-run/react'
import React from 'react'
import { AiOutlineGoogle } from 'react-icons/ai'
import { AuthorizationError } from 'remix-auth'
import { redirectWithError, redirectWithSuccess } from 'remix-toast'

import Logo from '~/components/Logo'
import InputField from '~/components/ui/input-field'
import PasswordField from '~/components/ui/password-field'
import SubmitButton from '~/components/ui/submit-button'
import { Auth } from '~/services/auth/auth.server'
import { authSchema } from '~/validation/user-validation'

export async function action({ context, request }: ActionFunctionArgs) {
  const auth = new Auth(context)
  try {
    const result = await auth.authenticate('user-pass', request)
    return redirectWithSuccess('/login', `Welcome ${result.email}!`)
  } catch (e) {
    if (e instanceof Response) return e
    if (e instanceof AuthorizationError) {
      return redirectWithError('/signup', e.message)
    }
  }
}

export default function Signup() {
  const navigation = useNavigation()
  const id = React.useId()
  const [form, { email, password }] = useForm({
    id,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: authSchema })
    },
    shouldRevalidate: 'onInput',
    shouldValidate: 'onBlur',
  })

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
          <InputField
            label="Email Address"
            meta={email}
            placeholder="email@example.com"
            type="email"
          />

          <PasswordField label="Password" meta={password} showHelpText />
          <SubmitButton name="intent" value="signup">
            Sign Up
          </SubmitButton>
        </Form>
        <div className="divider my-0 w-full" />
        <p className="text-neutral-500">Or log in with:</p>
        <Form action="/auth/google" method="POST" className="w-full">
          <button className="btn btn-outline w-full">
            {navigation.state !== 'idle' &&
            navigation.formAction?.includes('google') ? (
              <span className="loading loading-spinner" />
            ) : (
              <AiOutlineGoogle className="mr-4 h-5 w-5" />
            )}
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
