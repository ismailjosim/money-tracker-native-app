import React from 'react'
import { ActivityIndicator, Text, View } from 'react-native'
import { AlertCircle } from 'lucide-react-native'

export function AccountStatusView({
  loading,
  error,
  empty,
}: {
  loading: boolean
  error: boolean
  empty: boolean
}) {
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <ActivityIndicator color="#00E599" size="large" />
      </View>
    )
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <AlertCircle size={36} color="#FF4D6D" />
        <Text className="mt-2.5 text-center text-sm font-semibold text-[#FF4D6D]">
          Couldn&apos;t load your accounts.
        </Text>
      </View>
    )
  }

  if (empty) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <AlertCircle size={36} color="#FF4D6D" />
        <Text className="mt-2.5 text-center text-sm font-semibold text-[#FF4D6D]">
          You need an account before creating a transaction.
        </Text>
      </View>
    )
  }

  return null
}
