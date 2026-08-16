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
    <View className="flex-1 justify-center">
      <View className="rounded-3xl border border-brand-surface-border bg-brand-surface p-8">
        {/* Logo */}
        <Image
          source={require('../../assets/images/transparent-logo.png')}
          className="h-24 w-24 self-center"
          resizeMode="contain"
        />

        {/* Success Badge */}
        <View className="mt-5 self-center rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5">
          <Text className="text-xs font-semibold text-primary">✓ SUCCESS</Text>
        </View>

        {/* Heading */}
        <Text className="mt-6 text-center text-3xl font-black text-brand-text-primary">
          {title}
        </Text>

        {/* Description */}
        <Text className="mt-4 text-center text-base leading-7 text-brand-text-secondary">
          {description ??
            `Welcome ${
              firstName ? firstName : ''
            }! Your Wallex account is ready. Start tracking your income, expenses and savings with confidence.`}
        </Text>

        {/* Feature Summary */}
        <View className="mt-8 space-y-4">
          <Feature text="Track income & expenses" />
          <Feature text="Monitor budgets easily" />
          <Feature text="Visual financial insights" />
          <Feature text="Secure cloud synchronization" />
        </View>

        {/* Continue Button */}
        <View className="mt-8">
          <PrimaryButton title={buttonText} onPress={onContinue} />
        </View>

        {/* Footer */}
        <TouchableOpacity activeOpacity={0.8} className="mt-5">
          <Text className="text-center text-sm text-brand-text-secondary">
            Need help? <Text className="font-semibold text-primary">Contact Support</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

function Feature({ text }: { text: string }) {
  return (
    <View className="flex-row items-center">
      <View className="mr-3 h-7 w-7 items-center justify-center rounded-full bg-primary">
        <Text className="text-xs font-bold text-white">✓</Text>
      </View>

      <Text className="flex-1 text-base text-brand-text-secondary">{text}</Text>
    </View>
  )
}
