import { useState } from 'react'
import {
	Alert,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	View,
} from 'react-native'

import SignInForm from '@/components/auth/SignInForm'
import { useRouter } from 'expo-router'

export default function SignInScreen() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const router = useRouter()
	const [loading, setLoading] = useState(false)
	const [googleLoading, setGoogleLoading] = useState(false)

	const [errors, setErrors] = useState<Record<string, string>>({})

	const validate = () => {
		const newErrors: Record<string, string> = {}

		if (!email.trim()) {
			newErrors.email = 'Email address is required'
		} else if (!/\S+@\S+\.\S+/.test(email)) {
			newErrors.email = 'Please enter a valid email address'
		}

		if (!password) {
			newErrors.password = 'Password is required'
		}

		setErrors(newErrors)

		return Object.keys(newErrors).length === 0
	}

	const handleSignIn = async () => {
		if (!validate()) return

		try {
			setLoading(true)

			/**
			 * TODO:
			 *
			 * await signIn.create({
			 *   identifier: email,
			 *   password,
			 * })
			 */

			await new Promise((resolve) => setTimeout(resolve, 1200))

			Alert.alert('Success', 'Signed in successfully.')
		} catch (error) {
			Alert.alert('Sign In Failed', 'Invalid email or password.')
		} finally {
			setLoading(false)
		}
	}

	const handleGoogleSignIn = async () => {
		try {
			setGoogleLoading(true)

			/**
			 * TODO:
			 *
			 * Clerk Google OAuth
			 * Better Auth Google OAuth
			 */

			await new Promise((resolve) => setTimeout(resolve, 1500))

			Alert.alert('Google Sign In', 'Google authentication coming soon.')
		} catch {
			Alert.alert('Error', 'Unable to sign in with Google.')
		} finally {
			setGoogleLoading(false)
		}
	}

	const handleForgotPassword = () => {
		Alert.alert('Forgot Password', 'Navigate to forgot password screen.')
	}

	const handleSignUp = () => {
		router.replace('/sign-up')
	}
	return (
		<KeyboardAvoidingView
			className='flex-1 bg-brand-bg'
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
		>
			<ScrollView
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps='handled'
				contentContainerStyle={{
					flexGrow: 1,
				}}
			>
				<View className='flex-1 justify-center px-6 py-10'>
					<SignInForm
						email={email}
						password={password}
						errors={errors}
						loading={loading}
						googleLoading={googleLoading}
						onEmailChange={setEmail}
						onPasswordChange={setPassword}
						onSubmit={handleSignIn}
						onGoogleSignIn={handleGoogleSignIn}
						onForgotPassword={handleForgotPassword}
						onSignUp={handleSignUp}
					/>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	)
}
