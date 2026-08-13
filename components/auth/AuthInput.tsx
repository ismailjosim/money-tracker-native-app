import React from 'react'
import { Text, TextInput, TextInputProps, View } from 'react-native'

interface AuthInputProps extends TextInputProps {
	label?: string
	error?: string
	leftIcon?: React.ReactNode
}

export default function AuthInput({
	label,
	error,
	leftIcon,
	editable = true,
	...props
}: AuthInputProps) {
	return (
		<View className='mb-5'>
			{label && (
				<Text className='text-brand-text-primary text-sm font-semibold mb-2'>
					{label}
				</Text>
			)}

			<View
				className={`
					flex-row
					items-center
					rounded-2xl
					border
					px-4
					h-14
					bg-brand-surface
					${error ? 'border-brand-coral' : 'border-brand-surface-border'}
					${!editable ? 'opacity-60' : ''}
				`}
			>
				{leftIcon && <View className='mr-3'>{leftIcon}</View>}

				<TextInput
					{...props}
					editable={editable}
					placeholderTextColor='#5C5F68'
					className='flex-1 text-base text-brand-text-primary'
					cursorColor='#10B981'
					selectionColor='#10B981'
				/>
			</View>

			{error ? (
				<Text className='text-brand-coral text-xs mt-2 font-medium'>
					{error}
				</Text>
			) : null}
		</View>
	)
}
