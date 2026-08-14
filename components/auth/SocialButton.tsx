import React from 'react'
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native'
import { AntDesign } from '@expo/vector-icons'

type Provider = 'google' | 'apple' | 'github'

interface SocialButtonProps extends TouchableOpacityProps {
  provider?: Provider
  title?: string
  loading?: boolean
}

const providerConfig = {
  google: {
    title: 'Continue with Google',
    icon: 'google',
  },
  apple: {
    title: 'Continue with Apple',
    icon: 'apple1',
  },
  github: {
    title: 'Continue with GitHub',
    icon: 'github',
  },
} as const

export default function SocialButton({
  provider = 'google',
  title,
  loading = false,
  disabled,
  ...props
}: SocialButtonProps) {
  const config = providerConfig[provider]

  const isDisabled = loading || disabled

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={isDisabled}
      className={`w-full rounded-2xl border border-brand-surface-border bg-brand-surface ${
        isDisabled ? 'opacity-60' : ''
      }`}
      {...props}
    >
      <View className="h-14 flex-row items-center justify-center px-4">
        {loading ? (
          <ActivityIndicator size="small" color="#F2EFE9" />
        ) : (
          <>
            <AntDesign name={config.icon as any} size={20} color="#F2EFE9" />

            <Text className="ml-3 text-base font-semibold text-brand-text-primary">
              {title ?? config.title}
            </Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  )
}
