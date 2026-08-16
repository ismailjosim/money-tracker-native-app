import React from 'react'
import { ActivityIndicator, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

interface PrimaryButtonProps extends TouchableOpacityProps {
  title: string
  loading?: boolean
  fullWidth?: boolean
}

export default function PrimaryButton({
  title,
  loading = false,
  fullWidth = true,
  disabled,
  ...props
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      disabled={isDisabled}
      className={`${fullWidth ? 'w-full' : ''} overflow-hidden rounded-lg ${
        isDisabled ? 'opacity-50' : ''
      }`}
      {...props}
    >
      <LinearGradient
        colors={['#253BCE', '#00A896', '#84CC16']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="items-center justify-center px-6 py-4"
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text className="py-2 text-center text-lg font-bold tracking-wide text-white">
            {title}
          </Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  )
}
