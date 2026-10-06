import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { Calendar as CalendarIcon } from 'lucide-react-native'
import { format } from 'date-fns'
import * as Haptics from 'expo-haptics'
import { CalendarPicker } from './CalendarPicker'

export function DateSelector({
  date,
  isOpen,
  onToggle,
  onSelectDate,
}: {
  date: Date
  isOpen: boolean
  onToggle: () => void
  onSelectDate: (d: Date) => void
}) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        Date
      </Text>
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
          onToggle()
        }}
        activeOpacity={0.8}
        className="flex-row items-center justify-between rounded-2xl border border-white/10 bg-[#111420] px-4 py-3.5"
      >
        <View className="flex-row items-center gap-2.5">
          <CalendarIcon size={16} color="#00E599" />
          <Text className="text-sm font-semibold text-white">{format(date, 'd MMMM yyyy')}</Text>
        </View>
        <Text className="text-xs font-bold text-[#00E599]">{isOpen ? 'Hide' : 'Change'}</Text>
      </TouchableOpacity>

      {isOpen && (
        <View className="mt-2.5 overflow-hidden rounded-2xl border border-white/10 bg-[#111420] p-2">
          <CalendarPicker value={date} maximumDate={new Date()} onChange={onSelectDate} />
        </View>
      )}
    </View>
  )
}
