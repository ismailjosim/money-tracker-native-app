import React from 'react'
import { Image, Text, View } from 'react-native'

interface AuthHeaderProps {
  title: string
  subtitle?: string
  showTagline?: boolean
}

export default function AuthHeader({ title, subtitle, showTagline = false }: AuthHeaderProps) {
  return (
    <View className="mb-10 items-center">
      {/* Logo */}
      <Image
        source={require('../../assets/images/transparent-logo.png')}
        className="h-20 w-20"
        resizeMode="contain"
      />

      {/* Brand Name */}
      <Text className="mt-3 text-3xl font-black text-brand-text-primary">Wallex</Text>

      {/* Brand Tagline */}
      {showTagline && (
        <View className="mt-2 flex-row items-center">
          <Text className="text-sm font-bold text-primary-start">Track.</Text>

          <Text className="mx-1 text-sm text-brand-text-secondary">•</Text>

          <Text className="text-sm font-bold text-primary-mid">Manage.</Text>

          <Text className="mx-1 text-sm text-brand-text-secondary">•</Text>

          <Text className="text-sm font-bold text-primary-end">Grow.</Text>
        </View>
      )}

      {/* Screen Title */}
      <Text className="mt-8 text-center text-3xl font-extrabold text-brand-text-primary">
        {title}
      </Text>

      {/* Subtitle */}
      {subtitle ? (
        <Text className="mt-3 px-8 text-center text-base leading-6 text-brand-text-secondary">
          {subtitle}
        </Text>
      ) : null}
    </View>
  )
}
