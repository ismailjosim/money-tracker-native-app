import React from 'react'
import { Image, Text, View } from 'react-native'

interface AuthHeaderProps {
	title: string
	subtitle?: string
	showTagline?: boolean
}

export default function AuthHeader({
	title,
	subtitle,
	showTagline = false,
}: AuthHeaderProps) {
	return (
		<View className='items-center mb-10'>
			{/* Logo */}
			<Image
				source={require('../../assets/images/transparent-logo.png')}
				className='w-20 h-20'
				resizeMode='contain'
			/>

			{/* Brand Name */}
			<Text className='text-3xl font-black text-brand-text-primary mt-3'>
				Wallex
			</Text>

			{/* Brand Tagline */}
			{showTagline && (
				<View className='flex-row items-center mt-2'>
					<Text className='text-primary-start font-bold text-sm'>Track.</Text>

					<Text className='text-brand-text-secondary text-sm mx-1'>•</Text>

					<Text className='text-primary-mid font-bold text-sm'>Manage.</Text>

					<Text className='text-brand-text-secondary text-sm mx-1'>•</Text>

					<Text className='text-primary-end font-bold text-sm'>Grow.</Text>
				</View>
			)}

			{/* Screen Title */}
			<Text className='text-3xl font-extrabold text-brand-text-primary mt-8 text-center'>
				{title}
			</Text>

			{/* Subtitle */}
			{subtitle ? (
				<Text className='text-brand-text-secondary text-center text-base mt-3 px-8 leading-6'>
					{subtitle}
				</Text>
			) : null}
		</View>
	)
}
