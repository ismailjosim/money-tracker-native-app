import React from 'react'
import { Feather } from '@expo/vector-icons'
import { Text, TouchableOpacity, View } from 'react-native'

function Row({
  icon,
  label,
  value,
  onPress,
  showChevron = true,
  danger = false,
}: {
  icon: keyof typeof Feather.glyphMap
  label: string
  value?: string
  onPress?: () => void
  showChevron?: boolean
  danger?: boolean
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
      className="flex-row items-center border-b border-white/[0.04] bg-[#111420] px-4 py-3.5"
    >
      <View
        className={`mr-3 h-8 w-8 items-center justify-center rounded-full ${
          danger ? 'bg-[#FF4D6D]/15' : 'bg-[#00E599]/10'
        }`}
      >
        <Feather name={icon} size={15} color={danger ? '#FF4D6D' : '#00E599'} />
      </View>

      <Text className={`flex-1 text-sm font-semibold ${danger ? 'text-[#FF4D6D]' : 'text-white'}`}>
        {label}
      </Text>

      {value && <Text className="mr-2 text-xs font-medium text-slate-400">{value}</Text>}

      {showChevron && onPress && <Feather name="chevron-right" size={16} color="#64748B" />}
    </TouchableOpacity>
  )
}

export default Row
