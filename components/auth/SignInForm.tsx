import { SignInFormValues } from '@/lib/schemas/auth'
import React from 'react'
import { Control, Controller, FieldErrors } from 'react-hook-form'
import { Text, TouchableOpacity, View } from 'react-native'

import AuthHeader from './AuthHeader'
import AuthInput from './AuthInput'
import Divider from './Divider'
import PasswordInput from './PasswordInput'
import PrimaryButton from './PrimaryButton'
import SocialButton from './SocialButton'

interface SignInFormProps {
  control: Control<SignInFormValues>
  errors: FieldErrors<SignInFormValues>
  clerkErrors?: {
    identifier?: { message: string } | null
    password?: { message: string } | null
  } | null
  loading?: boolean
  googleLoading?: boolean
  onSubmit: () => void
  onGoogleSignIn: () => void
  onForgotPassword: () => void
  onSignUp: () => void
}

export default function SignInForm({
  control,
  errors,
  clerkErrors,
  loading = false,
  googleLoading = false,
  onSubmit,
  onGoogleSignIn,
  onForgotPassword,
  onSignUp,
}: SignInFormProps) {
  return (
    <>
      <AuthHeader title="Welcome Back" subtitle="Sign in to continue managing your finances." />

      <View className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#111420]">
        <Controller
          control={control}
          name="email"
          render={({ field: { value, onChange, onBlur } }) => (
            <AuthInput
              label="Email Address"
              placeholder="john@example.com"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.email?.message ?? clerkErrors?.identifier?.message}
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              keyboardType="email-address"
              returnKeyType="next"
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { value, onChange, onBlur } }) => (
            <PasswordInput
              label="Password"
              placeholder="Enter your password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.password?.message ?? clerkErrors?.password?.message}
              autoComplete="password"
              textContentType="password"
              returnKeyType="done"
            />
          )}
        />

        <View className="mb-5 items-end">
          <TouchableOpacity onPress={onForgotPassword} activeOpacity={0.7}>
            <Text className="text-sm font-semibold text-primary">Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <PrimaryButton title="Sign In" loading={loading} onPress={onSubmit} />

        <View className="my-6">
          <Divider text="OR" />
        </View>

        <SocialButton provider="google" loading={googleLoading} onPress={onGoogleSignIn} />

        <View className="mt-6 flex-row items-center justify-center">
          <Text className="text-sm text-slate-500 dark:text-slate-400">
            Don&apos;t have an account?
          </Text>

          <TouchableOpacity onPress={onSignUp} activeOpacity={0.7}>
            <Text className="ml-2 text-sm font-semibold text-primary">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  )
}
