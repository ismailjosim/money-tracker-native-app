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
      activeOpacity={0.8}
      disabled={isDisabled}
      className={`${fullWidth ? 'w-full' : ''} overflow-hidden rounded-2xl shadow-lg shadow-emerald-500/20 ${
        isDisabled ? 'opacity-50' : ''
      }`}
      {...props}
    >
      <LinearGradient
        colors={['#00E599', '#00B4D8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="items-center justify-center px-6 py-4"
      >
        {loading ? (
          <ActivityIndicator color="#08090D" size="small" />
        ) : (
          <Text className="text-center text-base font-bold tracking-wide text-[#08090D]">
            {title}
          </Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  )
}
