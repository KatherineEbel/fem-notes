import { FieldMetadata, getInputProps } from '@conform-to/react'
import { clsx } from 'clsx'
import React from 'react'

export type InputFieldProps = {
  label: string
  meta: FieldMetadata<string | number>
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> & {
    type?:
      | 'text'
      | 'password'
      | 'email'
      | 'number'
      | 'hidden'
      | 'checkbox'
      | 'color'
      | 'date'
      | 'datetime-local'
      | 'file'
      | 'month'
      | 'radio'
      | 'range'
      | 'search'
      | 'tel'
      | 'time'
      | 'url'
      | 'week'
  }

export default function InputField({
  label,
  meta,
  type = 'text',
  ...props
}: InputFieldProps) {
  return (
    <label htmlFor={meta.id} className="form-control w-full">
      <div className="label">
        <span className="label-text">{label}</span>
      </div>
      <input
        {...props}
        {...getInputProps(meta, { type: type, ariaAttributes: true })}
        className={clsx(
          'input input-bordered w-full',
          meta.errors && 'input-error',
        )}
      />
      {meta.errors ? (
        <div className="label">
          <span className="label-text-alt text-xs text-error">
            {meta.errors.join(', ')}
          </span>
        </div>
      ) : null}
    </label>
  )
}
