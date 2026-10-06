import React from 'react'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { CheckCircle2 } from 'lucide-react-native'

export function SubmitTransactionButton({
  saving,
  onPress,
}: {
  saving: boolean
  onPress: () => void
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={saving}
      activeOpacity={0.85}
      className="mt-2 overflow-hidden rounded-2xl shadow-lg shadow-[#00E599]/20"
    >
      <LinearGradient
        colors={['#00E599', '#00B4D8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="items-center justify-center py-4"
      >
        {saving ? (
          <ActivityIndicator color="#08090D" />
        ) : (
          <View className="flex-row items-center justify-center gap-2">
            <CheckCircle2 size={18} color="#08090D" strokeWidth={2.5} />
            <Text className="text-sm font-black uppercase tracking-wider text-[#08090D]">
              Save Transaction
            </Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  )
}
