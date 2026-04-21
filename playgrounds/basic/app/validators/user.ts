import { z } from 'zod'

/**
 * Shared rules for email and password.
 */
const email = () => z.string().email().max(254)
const password = () => z.string().min(8).max(32)

/**
 * Validator to use when performing self-signup
 */
export const signupValidator = z.object({
  fullName: z.string(),
  email: email(),
  password: password(),
  passwordConfirmation: z.string(),
}).refine((data) => data.password === data.passwordConfirmation, {
  message: 'Passwords do not match',
  path: ['passwordConfirmation'],
})
