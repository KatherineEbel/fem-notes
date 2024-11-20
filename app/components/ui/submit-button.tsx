import { clsx } from 'clsx'
import React, { ComponentProps } from 'react'

export type SubmitButtonProps = {
  children: React.ReactNode
  loading?: boolean
} & ComponentProps<'button'>

export default function SubmitButton({
  children,
  className,
  loading = false,
  ...props
}: SubmitButtonProps) {
  return (
    <button
      disabled={loading}
      type="submit"
      {...props}
      className={clsx('btn btn-primary my-4 w-full', className)}
    >
      {loading ? <span className="loading loading-spinner" /> : null}
      {children}
    </button>
  )
}
