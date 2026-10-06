import React from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import * as Haptics from 'expo-haptics'

export type PillOption<T extends string> = {
  key: T
  label: string
  icon?: string
}

export function PillGroup<T extends string>({
  options,
  value,
  onChange,
  scrollable = true,
}: {
  options: PillOption<T>[]
  value: T
  onChange: (key: T) => void
  scrollable?: boolean
}) {
  const row = (
    <View className="flex-row gap-2">
      {options.map(option => {
        const isSelected = value === option.key
        return (
          <TouchableOpacity
            key={option.key}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
              onChange(option.key)
            }}
            activeOpacity={0.7}
            className={`flex-row items-center gap-1.5 rounded-xl border px-3 py-2 ${
              isSelected ? 'border-[#00E599] bg-[#00E599]' : 'border-white/10 bg-[#111420]'
            }`}
          >
            {option.icon && <Text className="mr-0.5 text-lg">{option.icon}</Text>}
            <Text
              className={`text-xs ${
                isSelected ? 'font-bold text-[#08090D]' : 'font-semibold text-slate-400'
              }`}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )

  if (!scrollable) return row

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingVertical: 2 }}
    >
      {row}
    </ScrollView>
  )
}
