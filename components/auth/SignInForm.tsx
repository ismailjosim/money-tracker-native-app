import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

import AuthHeader from './AuthHeader'
import AuthInput from './AuthInput'
import PasswordInput from './PasswordInput'
import PrimaryButton from './PrimaryButton'
import SocialButton from './SocialButton'
import Divider from './Divider'

interface SignInFormProps {
	email: string
	password: string

	errors: Record<string, string>

	loading?: boolean
	googleLoading?: boolean

	onEmailChange: (value: string) => void
	onPasswordChange: (value: string) => void

	onSubmit: () => void
	onGoogleSignIn: () => void
	onForgotPassword: () => void
	onSignUp: () => void
}

export default function SignInForm({
	email,
	password,
	errors,
	loading = false,
	googleLoading = false,
	onEmailChange,
	onPasswordChange,
	onSubmit,
	onGoogleSignIn,
	onForgotPassword,
	onSignUp,
}: SignInFormProps) {
	return (
		<>
			<AuthHeader
				title='Welcome Back'
				subtitle='Sign in to continue managing your finances.'
			/>

			<View className='bg-brand-surface border border-brand-surface-border rounded-3xl p-6'>
				<AuthInput
					label='Email Address'
					placeholder='john@example.com'
					value={email}
					onChangeText={onEmailChange}
					error={errors.email}
					autoCapitalize='none'
					autoComplete='email'
					textContentType='emailAddress'
					keyboardType='email-address'
					returnKeyType='next'
				/>

				<PasswordInput
					label='Password'
					placeholder='Enter your password'
					value={password}
					onChangeText={onPasswordChange}
					error={errors.password}
					autoComplete='password'
					textContentType='password'
					returnKeyType='done'
				/>

				<View className='items-end mb-5'>
					<TouchableOpacity onPress={onForgotPassword} activeOpacity={0.7}>
						<Text className='text-primary text-sm font-semibold'>
							Forgot Password?
						</Text>
					</TouchableOpacity>
				</View>

				<PrimaryButton title='Sign In' loading={loading} onPress={onSubmit} />

				<View className='my-6'>
					<Divider text='OR' />
				</View>

				<SocialButton
					provider='google'
					loading={googleLoading}
					onPress={onGoogleSignIn}
				/>

				<View className='flex-row justify-center items-center mt-6'>
					<Text className='text-brand-text-secondary text-sm'>
						Don&apos;t have an account?
					</Text>

					<TouchableOpacity onPress={onSignUp} activeOpacity={0.7}>
						<Text className='ml-2 text-primary text-sm font-semibold'>
							Sign Up
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		</>
	)
}
