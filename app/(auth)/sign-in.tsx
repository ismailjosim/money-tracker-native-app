import { SignInFormValues, signInSchema } from '@/lib/schemas/auth'
import { useSignIn } from '@clerk/expo'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'expo-router'
import { useForm } from 'react-hook-form'
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native'

import SignInForm from '@/components/auth/SignInForm'

export default function SignInScreen() {
  const { signIn, errors, fetchStatus } = useSignIn()
  const router = useRouter()

  const isLoading = fetchStatus === 'fetching'

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    mode: 'all',
    defaultValues: { email: '', password: '' },
  })

  const handleSignIn = async (values: SignInFormValues) => {
    const { error } = await signIn.password({
      emailAddress: values.email,
      password: values.password,
    })

    if (error) {
      console.error(JSON.stringify(error, null, 2))
      return
    }

    if (signIn.status === 'complete') {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) return
          router.replace('/(root)/(tabs)')
        },
      })
    } else if (signIn.status === 'needs_second_factor') {
      await signIn.mfa.sendPhoneCode()
    } else if (signIn.status === 'needs_client_trust') {
      const emailCodeFactor = signIn.supportedSecondFactors.find(
        factor => factor.strategy === 'email_code'
      )
      if (emailCodeFactor) await signIn.mfa.sendEmailCode()
    } else {
      console.error('Sign-in attempt not complete:', signIn)
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
