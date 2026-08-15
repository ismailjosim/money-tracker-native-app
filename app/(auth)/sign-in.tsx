import { SignInFormValues, signInSchema } from '@/lib/schemas/auth'
import { useSignIn } from '@clerk/expo'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

import SignInForm from '@/components/auth/SignInForm'

export default function SignInScreen() {
  const { signIn, errors, fetchStatus } = useSignIn()
  const router = useRouter()
  const [verificationCode, setVerificationCode] = useState('')
  const [showVerification, setShowVerification] = useState(false)
  const [isVerifyingCode, setIsVerifyingCode] = useState(false)

  const isLoading = fetchStatus === 'fetching'

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    mode: 'all',
    defaultValues: { email: '', password: '' },
  })

  const finishSignIn = async () => {
    await signIn.finalize({
      navigate: ({ session, decorateUrl }) => {
        if (session?.currentTask) return
        const url = decorateUrl('/')
        router.replace(url as any)
      },
    })
  }

  const handleSignIn = async (values: SignInFormValues) => {
    try {
      const { error } = await signIn.password({
        emailAddress: values.email,
        password: values.password,
      })

      if (error) {
        console.error(JSON.stringify(error, null, 2))
        return
      }

      if (signIn.status === 'complete') {
        await finishSignIn()
      } else if (signIn.status === 'needs_second_factor') {
        await signIn.mfa.sendPhoneCode()
      } else if (signIn.status === 'needs_client_trust') {
        const emailCodeFactor = signIn.supportedSecondFactors.find(
          factor => factor.strategy === 'email_code'
        )

        if (emailCodeFactor) {
          await signIn.mfa.sendEmailCode()
          setShowVerification(true)
        }
      } else {
        console.error('Sign-in attempt not complete:', signIn)
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2))
    }
  }

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      Alert.alert('Verification code required', 'Please enter the 6-digit code sent to your email.')
      return
    }

    try {
      setIsVerifyingCode(true)
      await signIn.mfa.verifyEmailCode({ code: verificationCode })

      if (signIn.status === 'complete') {
        await finishSignIn()
      } else {
        Alert.alert('Verification failed', 'The code is invalid or expired. Please try again.')
      }
    } catch (err: any) {
      console.error('Email verification failed:', err)
      Alert.alert('Verification failed', 'Please check the code and try again.')
    } finally {
      setIsVerifyingCode(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      Alert.alert('Google Sign In', 'Google authentication coming soon.')
    } catch {
      Alert.alert('Error', 'Unable to sign in with Google.')
    }
  }

  const handleForgotPassword = () => {
    Alert.alert('Forgot Password', 'Navigate to forgot password screen.')
  }

  if (showVerification || signIn.status === 'needs_client_trust') {
    return (
      <KeyboardAvoidingView
        className="flex-1 bg-brand-bg"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="flex-1 justify-center px-6 py-10">
            <Text className="mb-2 text-3xl font-bold text-white">Verify your account</Text>
            <Text className="mb-6 text-base text-brand-text-secondary">
              Enter the 6-digit code sent to {signIn.identifier || form.getValues('email')}
            </Text>

            <View className="rounded-3xl border border-brand-surface-border bg-brand-surface p-6">
              <Text className="mb-2 text-sm font-medium text-brand-text-secondary">
                Verification code
              </Text>
              <TextInput
                value={verificationCode}
                onChangeText={text => setVerificationCode(text.replace(/[^0-9]/g, '').slice(0, 6))}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="sms-otp"
                maxLength={6}
                placeholder="123456"
                className="mb-4 rounded-xl border border-brand-surface-border bg-white px-4 py-3 text-base text-brand-bg"
              />

              <TouchableOpacity
                onPress={handleVerifyCode}
                disabled={isVerifyingCode}
                activeOpacity={0.8}
                className="rounded-xl bg-primary px-4 py-3"
              >
                <Text className="text-center text-base font-semibold text-white">
                  {isVerifyingCode ? 'Verifying...' : 'Verify'}
                </Text>
              </TouchableOpacity>

              <View className="mt-5 flex-row items-center justify-between">
                <TouchableOpacity
                  onPress={async () => {
                    try {
                      await signIn.mfa.sendEmailCode()
                      Alert.alert('Code sent', 'A new verification code was sent to your email.')
                    } catch (error) {
                      console.error('Resend code failed:', error)
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Text className="text-sm font-semibold text-primary">Resend code</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    signIn.reset()
                    setShowVerification(false)
                    setVerificationCode('')
                  }}
                  activeOpacity={0.7}
                >
                  <Text className="text-sm text-brand-text-secondary">Back</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    )
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-brand-bg"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="flex-1 justify-center px-6 py-10">
          <SignInForm
            control={form.control}
            errors={form.formState.errors}
            clerkErrors={errors.fields as any}
            loading={isLoading}
            onSubmit={form.handleSubmit(handleSignIn)}
            onGoogleSignIn={handleGoogleSignIn}
            onForgotPassword={handleForgotPassword}
            onSignUp={() => router.replace('/sign-up')}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
