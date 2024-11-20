import { FieldMetadata, getInputProps } from '@conform-to/react'
import React, { ComponentProps } from 'react'
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi'
import { LuInfo } from 'react-icons/lu'

export type PasswordFieldProps = {
  label: string
  showHelpText?: boolean
  meta: FieldMetadata<string | number>
} & ComponentProps<'input'>

export default function PasswordField({
  label,
  meta,
  showHelpText = false,
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = React.useState(false)
  return (
    <label htmlFor={meta.id} className="form-control w-full">
      <div className="label">
        <span className="label-text">{label}</span>
      </div>
      <div className="relative">
        <input
          {...getInputProps(meta, {
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
      {meta.errors ? (
        <div className="label">
          <span className="label-text-alt text-xs text-error">
            {meta.errors.join(', ')}
          </span>
        </div>
      ) : showHelpText ? (
        <div className="label text-neutral-600">
          <div className="label-text-alt flex items-center gap-1 text-neutral-600 dark:text-neutral-300">
            <LuInfo />
            <span>At least 8 characters</span>
          </div>
        </div>
      ) : null}
    </label>
  )
}
