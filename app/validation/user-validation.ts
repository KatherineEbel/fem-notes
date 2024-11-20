import { z } from 'zod'

const userSchema = z.object({
  email: z
    .string({ message: 'Email is required.' })
    .email({ message: 'Please provide a valid email.' }),
})

export const signupSchema = userSchema.extend({
  intent: z.literal('signup'),
  password: z
    .string({ message: 'Password is required.' })
    .min(8, { message: 'Password of at least 8 characters is required.' }),
})

export const loginSchema = userSchema.extend({
  intent: z.literal('login'),
  password: z.string({ message: 'Password is required.' }),
})

export const authSchema = z.discriminatedUnion('intent', [
  signupSchema,
  loginSchema,
])

const newPasswordSchema = z.object({
  password: z
    .string({ message: 'Password is required.' })
    .min(8, { message: 'Password of at least 8 characters is required.' }),
  confirmPassword: z
    .string({ message: 'Confirm password is required.' })
    .min(8, { message: 'Password of at least 8 characters is required.' }),
})

function withPasswordMatch<T extends z.ZodTypeAny>(schema: T): z.ZodEffects<T> {
  return schema.superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password and Confirm Password must match',
        path: ['confirmPassword'], // Error is attached to confirmPassword
      })
    }
  })
}

// Schema for changing passwords (includes oldPassword)
const oldPasswordSchema = newPasswordSchema.extend({
  oldPassword: z.string({ message: 'Old password is required.' }),
})

export const resetPasswordSchema = withPasswordMatch(newPasswordSchema) // For reset password
export const changePasswordSchema = withPasswordMatch(oldPasswordSchema)
