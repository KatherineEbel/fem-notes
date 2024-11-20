import { getFormProps, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { Form, useActionData, useNavigation } from '@remix-run/react'

import PasswordField from '~/components/ui/password-field'
import SubmitButton from '~/components/ui/submit-button'
import { action } from '~/routes/_auth+/forgot-password'
import { changePasswordSchema as schema } from '~/validation/user-validation'

export default function ChangePassword() {
  const lastResult = useActionData<typeof action>()
  const navigation = useNavigation()
  const [form, { oldPassword, password, confirmPassword }] = useForm({
    lastResult: navigation.state === 'idle' ? lastResult : null,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema })
    },
    shouldRevalidate: 'onInput',
    shouldValidate: 'onSubmit',
  })

  return (
    <div>
      <h1 className="font-semibold">Change Password</h1>
      <Form
        method="POST"
        {...getFormProps(form)}
        className="mt-4 flex w-full max-w-xl flex-col gap-y-2"
      >
        <PasswordField meta={oldPassword} label="Old Password" />
        <PasswordField meta={password} label="New Password" showHelpText />
        <PasswordField meta={confirmPassword} label="Confirm Password" />

        <div className="ml-auto">
          <SubmitButton loading={navigation.state !== 'idle'} className="">
            Save Password
          </SubmitButton>
        </div>
      </Form>
    </div>
  )
}
