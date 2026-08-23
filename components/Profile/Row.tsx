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
      className="flex-row items-center border-b border-[#F0EEE7] bg-white px-4 py-3.5 last:border-b-0"
    >
      <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-[#F5F4F0]">
        <Feather name={icon} size={15} color={danger ? '#FF6B4A' : '#5C5F68'} />
      </View>
      <Text className={`flex-1 text-sm ${danger ? 'text-brand-coral' : 'text-brand-bg'}`}>
        {label}
      </Text>
      {value && <Text className="mr-2 text-xs text-brand-text-secondary">{value}</Text>}
      {showChevron && onPress && <Feather name="chevron-right" size={16} color="#BDC3C7" />}
    </TouchableOpacity>
  )
}

export default Row
