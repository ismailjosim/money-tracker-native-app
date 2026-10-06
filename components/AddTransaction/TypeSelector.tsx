import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'

export function TypeSelector({
  value,
  onChange,
}: {
  value: 'EXPENSE' | 'INCOME'
  onChange: (type: 'EXPENSE' | 'INCOME') => void
}) {
  return (
    <View className="mb-4 flex-row rounded-2xl border border-white/10 bg-[#111420] p-1.5">
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
          onChange('EXPENSE')
        }}
        activeOpacity={0.8}
        className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-xl py-3 ${
          value === 'EXPENSE' ? 'bg-[#FF4D6D]' : ''
        }`}
      >
        <ArrowDownLeft
          size={16}
          color={value === 'EXPENSE' ? '#08090D' : '#64748B'}
          strokeWidth={2.5}
        />
        <Text
          className={`text-xs ${
            value === 'EXPENSE' ? 'font-black text-[#08090D]' : 'font-bold text-slate-400'
          }`}
        >
          Expense
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
          onChange('INCOME')
        }}
        activeOpacity={0.8}
        className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-xl py-3 ${
          value === 'INCOME' ? 'bg-[#00E599]' : ''
        }`}
      >
        <ArrowUpRight
          size={16}
          color={value === 'INCOME' ? '#08090D' : '#64748B'}
          strokeWidth={2.5}
        />
        <Text
          className={`text-xs ${
            value === 'INCOME' ? 'font-black text-[#08090D]' : 'font-bold text-slate-400'
          }`}
        >
          Income
        </Text>
      </TouchableOpacity>
    </View>
  )
}
