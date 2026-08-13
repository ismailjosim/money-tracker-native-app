import { useState } from 'react'
import {
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	View,
	Alert,
} from 'react-native'

import SignUpForm from '@/components/auth/SignUpForm'
import VerifyForm from '@/components/auth/VerifyForm'
import SuccessScreen from '@/components/auth/SuccessScreen'
import { useRouter } from 'expo-router'

type Step = 'signup' | 'verify' | 'success'

export default function SignUpScreen() {
	const [step, setStep] = useState<Step>('signup')
	const router = useRouter()
	const [loading, setLoading] = useState(false)

	const [firstName, setFirstName] = useState('')
	const [lastName, setLastName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [verificationCode, setVerificationCode] = useState('')

	const [errors, setErrors] = useState<Record<string, string>>({})
	const [verifyError, setVerifyError] = useState('')
	const [resendMessage, setResendMessage] = useState('')

	const validateSignUp = () => {
		const newErrors: Record<string, string> = {}

		if (!firstName.trim()) {
			newErrors.firstName = 'First name is required'
		}

		if (!lastName.trim()) {
			newErrors.lastName = 'Last name is required'
		}

		if (!email.trim()) {
			newErrors.email = 'Email is required'
		} else if (!/\S+@\S+\.\S+/.test(email)) {
			newErrors.email = 'Please enter a valid email'
		}

		if (!password) {
			newErrors.password = 'Password is required'
		} else if (password.length < 8) {
			newErrors.password = 'Password must contain at least 8 characters'
		}

		if (!confirmPassword) {
			newErrors.confirmPassword = 'Please confirm your password'
		} else if (password !== confirmPassword) {
			newErrors.confirmPassword = 'Passwords do not match'
		}

		setErrors(newErrors)

		return Object.keys(newErrors).length === 0
	}

	const handleSignUp = async () => {
		if (!validateSignUp()) return

		try {
			setLoading(true)

			// TODO:
			// Clerk / Better Auth signup
			// Send verification email

			await new Promise((resolve) => setTimeout(resolve, 1200))

			setStep('verify')
		} finally {
			setLoading(false)
		}
	}

	const handleVerify = async () => {
		if (verificationCode.length !== 6) {
			setVerifyError('Please enter the 6-digit verification code.')
			return
		}

		try {
			setLoading(true)
			setVerifyError('')

			// TODO:
			// Verify email

			await new Promise((resolve) => setTimeout(resolve, 1200))

			setStep('success')
		} finally {
			setLoading(false)
		}
	}

	const handleResend = async () => {
		setResendMessage('')

		try {
			// TODO:
			// resend verification email

			await new Promise((resolve) => setTimeout(resolve, 1000))

			setResendMessage('A new verification code has been sent.')

			setTimeout(() => {
				setResendMessage('')
			}, 4000)
		} catch {
			Alert.alert('Error', 'Unable to resend verification code.')
		}
	}

	const handleStartOver = () => {
		setVerificationCode('')
		setVerifyError('')
		setErrors({})
		setStep('signup')
	}
	const handleGoToDashboard = () => {
		// TODO:
		// router.replace('/(tabs)')
		Alert.alert('Success', 'Navigate to dashboard')
	}

	return (
		<KeyboardAvoidingView
			className='flex-1 bg-brand-bg'
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
		>
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{
					flexGrow: 1,
				}}
				keyboardShouldPersistTaps='handled'
			>
				<View className='flex-1 justify-center px-6 py-10'>
					{step === 'signup' && (
						<SignUpForm
							firstName={firstName}
							lastName={lastName}
							email={email}
							password={password}
							confirmPassword={confirmPassword}
							errors={errors}
							loading={loading}
							onFirstNameChange={setFirstName}
							onLastNameChange={setLastName}
							onEmailChange={setEmail}
							onPasswordChange={setPassword}
							onConfirmPasswordChange={setConfirmPassword}
							onSubmit={handleSignUp}
							onSignIn={() => router.replace('/sign-in')}
						/>
					)}

					{step === 'verify' && (
						<VerifyForm
							email={email}
							code={verificationCode}
							error={verifyError}
							message={resendMessage}
							loading={loading}
							onCodeChange={setVerificationCode}
							onVerify={handleVerify}
							onResend={handleResend}
							onBack={handleStartOver}
						/>
					)}

					{step === 'success' && (
						<SuccessScreen
							firstName={firstName}
							title='Welcome to Wallex!'
							description="Your account has been created successfully. You're all set to start tracking your finances."
							buttonText='Go to Dashboard'
							onContinue={handleGoToDashboard}
						/>
					)}
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	)
}
