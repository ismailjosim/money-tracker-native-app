import { z } from 'zod'

export const signUpSchema = z
  .object({
    firstName: z
      .string()
      .min(1, { message: 'FirstName is required' })
      .trim()
      .min(1, { message: 'FirstName is required' })
      .trim(),
    lastName: z
      .string()
      .min(1, { message: 'LastName is required' })
      .trim()
      .min(1, { message: 'LastName is required' })
      .trim(),
    email: z
      .email({ message: 'Invalid email address' })
      .trim()
      .min(1, { message: 'Email is required' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
    confirmPassword: z.string().min(8, {
      message: 'Confirm Password must be at least 8 characters long',
    }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const signInSchema = z.object({
  email: z
    .email({ message: 'Invalid email address' })
    .trim()
    .min(1, { message: 'Email is required' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
})

export const codeSchema = z.object({
  code: z.string().min(1, 'Enter the verification code.'),
})

export type SignUpFormValues = z.infer<typeof signUpSchema>
export type SignInFormValues = z.infer<typeof signInSchema>
export type CodeFormValues = z.infer<typeof codeSchema>
