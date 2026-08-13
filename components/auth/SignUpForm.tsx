import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

import AuthHeader from './AuthHeader'
import AuthInput from './AuthInput'
import PasswordInput from './PasswordInput'
import PrimaryButton from './PrimaryButton'

interface SignUpFormProps {
	firstName: string
	lastName: string
	email: string
	password: string
	confirmPassword: string

	errors: Record<string, string>

	loading?: boolean

	onFirstNameChange: (value: string) => void
	onLastNameChange: (value: string) => void
	onEmailChange: (value: string) => void
	onPasswordChange: (value: string) => void
	onConfirmPasswordChange: (value: string) => void

	onSubmit: () => void
	onSignIn: () => void
}

export default function SignUpForm({
	firstName,
	lastName,
	email,
	password,
	confirmPassword,
	errors,
	loading = false,
	onFirstNameChange,
	onLastNameChange,
	onEmailChange,
	onPasswordChange,
	onConfirmPasswordChange,
	onSubmit,
	onSignIn,
}: SignUpFormProps) {
	return (
		<>
			<AuthHeader
				title='Create Account'
				subtitle='Track your income, expenses and savings in one beautiful place.'
				showTagline
			/>

			<View className='bg-brand-surface border border-brand-surface-border rounded-3xl p-6'>
				<View className='flex-row gap-4'>
					<View className='flex-1'>
						<AuthInput
							label='First Name'
							placeholder='John'
							value={firstName}
							onChangeText={onFirstNameChange}
							error={errors.firstName}
							autoCapitalize='words'
							returnKeyType='next'
						/>
					</View>

					<View className='flex-1'>
						<AuthInput
							label='Last Name'
							placeholder='Doe'
							value={lastName}
							onChangeText={onLastNameChange}
							error={errors.lastName}
							autoCapitalize='words'
							returnKeyType='next'
						/>
					</View>
				</View>

				<AuthInput
					label='Email Address'
					placeholder='john@example.com'
					value={email}
					onChangeText={onEmailChange}
					error={errors.email}
					autoCapitalize='none'
					keyboardType='email-address'
					autoComplete='email'
					textContentType='emailAddress'
					returnKeyType='next'
				/>

				<PasswordInput
					label='Password'
					placeholder='Enter your password'
					value={password}
					onChangeText={onPasswordChange}
					error={errors.password}
					autoComplete='password-new'
					textContentType='newPassword'
					returnKeyType='next'
				/>

				<PasswordInput
					label='Confirm Password'
					placeholder='Confirm your password'
					value={confirmPassword}
					onChangeText={onConfirmPasswordChange}
					error={errors.confirmPassword}
					autoComplete='password-new'
					textContentType='newPassword'
					returnKeyType='done'
				/>
				<PrimaryButton
					title='Create Account'
					loading={loading}
					onPress={onSubmit}
				/>

				<View className='flex-row justify-center items-center mt-6'>
					<Text className='text-brand-text-secondary text-sm'>
						Already have an account?
					</Text>

					<TouchableOpacity onPress={onSignIn} activeOpacity={0.7}>
						<Text className='ml-2 text-primary font-semibold text-sm'>
							Sign In
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		</>
	)
}
