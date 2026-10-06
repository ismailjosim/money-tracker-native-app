import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { ChevronDown } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'

export function CurrencySelectorCard({
  currency,
  onPress,
}: {
  currency: { code: string; name: string; symbol: string }
  onPress: () => void
}) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-[11px] font-bold tracking-wider text-slate-400">
        BASE CURRENCY
      </Text>
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
          onPress()
        }}
        activeOpacity={0.8}
        className="flex-row items-center justify-between rounded-2xl border border-white/5 bg-[#161B2A] px-4 py-3.5"
      >
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-xl border border-[#00E599]/30 bg-[#00E599]/15">
            <Text className="text-base font-bold text-[#00E599]">{currency.symbol}</Text>
          </View>
          <View>
            <Text className="text-base font-bold tracking-wide text-white">{currency.code}</Text>
            <Text className="text-xs font-medium text-slate-400" numberOfLines={1}>
              {currency.name}
            </Text>
          </View>
        </View>
        <ChevronDown size={18} color="#94A3B8" />
      </TouchableOpacity>
    </View>
  )
}
