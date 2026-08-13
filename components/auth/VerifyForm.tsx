import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

import AuthHeader from './AuthHeader'
import AuthInput from './AuthInput'
import PrimaryButton from './PrimaryButton'

interface VerifyFormProps {
	email: string
	code: string

	error?: string
	message?: string
	loading?: boolean

	onCodeChange: (value: string) => void
	onVerify: () => void
	onResend: () => void
	onBack: () => void
}

export default function VerifyForm({
	email,
	code,
	error,
	message,
	loading = false,
	onCodeChange,
	onVerify,
	onResend,
	onBack,
}: VerifyFormProps) {
	return (
		<>
			<AuthHeader
				title='Verify Your Account'
				subtitle={`We've sent a 6-digit verification code to ${email}`}
			/>

			<View className='bg-brand-surface border border-brand-surface-border rounded-3xl p-6'>
				<AuthInput
					label='Verification Code'
					placeholder='123456'
					value={code}
					onChangeText={(text) => onCodeChange(text.replace(/[^0-9]/g, ''))}
					maxLength={6}
					keyboardType='number-pad'
					textContentType='oneTimeCode'
					autoComplete='sms-otp'
					returnKeyType='done'
					error={error}
				/>

				{message ? (
					<Text className='text-primary text-sm text-center mb-4'>
						{message}
					</Text>
				) : null}

				<PrimaryButton
					title='Verify Account'
					loading={loading}
					onPress={onVerify}
				/>

				<View className='mt-6 items-center'>
					<TouchableOpacity onPress={onResend} activeOpacity={0.7}>
						<Text className='text-primary font-semibold text-sm'>
							Didn&apos;t receive the code? Resend
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						onPress={onBack}
						activeOpacity={0.7}
						className='mt-4'
					>
						<Text className='text-brand-text-secondary text-sm'>
							Start over
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		</>
	)
}
