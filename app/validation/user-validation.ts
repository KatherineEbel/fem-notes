import { InferSelectModel } from 'drizzle-orm'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

import { user as userModel } from '~/db/schema'

export const signupSchema = createInsertSchema(userModel)
  .pick({ email: true })
  .extend({ password: z.string().min(8) })
  .merge(
    z.object({
      intent: z.literal('signup'),
    }),
  )

export const loginSchema = createSelectSchema(userModel)
  .pick({ email: true })
  .extend({ password: z.string().min(1) })
  .merge(
    z.object({
      intent: z.literal('login'),
    }),
  )

export const selectUserSchema = createSelectSchema(userModel)

export type User = InferSelectModel<typeof userModel>

export const authSchema = z.discriminatedUnion('intent', [
  signupSchema,
  loginSchema,
])

export const forgotPasswordForm = z.object({
  email: z.string().email(),
})

export const resetPasswordForm = z
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

export const verificationForm = z.object({
  code: z.string().length(6),
})
