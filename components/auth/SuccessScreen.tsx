import React from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'

import PrimaryButton from './PrimaryButton'

interface SuccessScreenProps {
	firstName?: string
	title?: string
	description?: string
	buttonText?: string
	onContinue: () => void
}

export default function SuccessScreen({
	firstName,
	title = 'Account Created!',
	description,
	buttonText = 'Go to Dashboard',
	onContinue,
}: SuccessScreenProps) {
	return (
		<View className='flex-1 justify-center'>
			<View className='bg-brand-surface border border-brand-surface-border rounded-3xl p-8'>
				{/* Logo */}
				<Image
					source={require('../../assets/images/transparent-logo.png')}
					className='w-24 h-24 self-center'
					resizeMode='contain'
				/>

				{/* Success Badge */}
				<View className='self-center mt-5 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20'>
					<Text className='text-primary font-semibold text-xs'>✓ SUCCESS</Text>
				</View>

				{/* Heading */}
				<Text className='text-3xl font-black text-brand-text-primary text-center mt-6'>
					{title}
				</Text>

				{/* Description */}
				<Text className='text-brand-text-secondary text-center text-base mt-4 leading-7'>
					{description ??
						`Welcome ${
							firstName ? firstName : ''
						}! Your Wallex account is ready. Start tracking your income, expenses and savings with confidence.`}
				</Text>

				{/* Feature Summary */}
				<View className='mt-8 space-y-4'>
					<Feature text='Track income & expenses' />
					<Feature text='Monitor budgets easily' />
					<Feature text='Visual financial insights' />
					<Feature text='Secure cloud synchronization' />
				</View>

				{/* Continue Button */}
				<View className='mt-8'>
					<PrimaryButton title={buttonText} onPress={onContinue} />
				</View>

				{/* Footer */}
				<TouchableOpacity activeOpacity={0.8} className='mt-5'>
					<Text className='text-center text-brand-text-secondary text-sm'>
						Need help?{' '}
						<Text className='text-primary font-semibold'>Contact Support</Text>
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	)
}

function Feature({ text }: { text: string }) {
	return (
		<View className='flex-row items-center'>
			<View className='w-7 h-7 rounded-full bg-primary items-center justify-center mr-3'>
				<Text className='text-white text-xs font-bold'>✓</Text>
			</View>

			<Text className='text-brand-text-secondary flex-1 text-base'>{text}</Text>
		</View>
	)
}
