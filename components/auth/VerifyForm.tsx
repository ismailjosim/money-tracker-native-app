import { CodeFormValues } from '@/lib/schemas/auth'
import React from 'react'
import { Control, Controller } from 'react-hook-form'
import { Text, TouchableOpacity, View } from 'react-native'

import AuthHeader from './AuthHeader'
import AuthInput from './AuthInput'
import PrimaryButton from './PrimaryButton'

interface VerifyFormProps {
  email: string
  control: Control<CodeFormValues>
  error?: string
  clerkError?: string
  message?: string
  loading?: boolean
  onVerify: () => void
  onResend: () => void
  onBack: () => void
}

export default function VerifyForm({
  email,
  control,
  error,
  clerkError,
  message,
  loading = false,
  onVerify,
  onResend,
  onBack,
}: VerifyFormProps) {
  return (
    <>
      <AuthHeader
        title="Verify Your Account"
        subtitle={`We've sent a 6-digit verification code to ${email}`}
      />

      <View className="rounded-3xl border border-brand-surface-border bg-brand-surface p-6">
        <Controller
          control={control}
          name="code"
          render={({ field: { value, onChange, onBlur } }) => (
            <AuthInput
              label="Verification Code"
              placeholder="123456"
              value={value}
              onChangeText={text => onChange(text.replace(/[^0-9]/g, ''))}
              onBlur={onBlur}
              maxLength={6}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              autoComplete="sms-otp"
              returnKeyType="done"
              error={error ?? clerkError}
            />
          )}
        />

        {message ? <Text className="mb-4 text-center text-sm text-primary">{message}</Text> : null}

        <PrimaryButton title="Verify Account" loading={loading} onPress={onVerify} />

        <View className="mt-6 items-center">
          <TouchableOpacity onPress={onResend} activeOpacity={0.7}>
            <Text className="text-sm font-semibold text-primary">
              Didn&apos;t receive the code? Resend
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onBack} activeOpacity={0.7} className="mt-4">
            <Text className="text-sm text-brand-text-secondary">Start over</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  )
}
