import { z } from 'zod'

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const signupSchema = userSchema.extend({
  intent: z.literal('signup'),
})

export const loginSchema = userSchema.extend({
  intent: z.literal('login'),
})

export const authSchema = z.discriminatedUnion('intent', [
  signupSchema,
  loginSchema,
])
