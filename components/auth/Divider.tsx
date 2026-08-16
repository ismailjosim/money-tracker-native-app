import { Text, View } from 'react-native'

interface DividerProps {
  text?: string
}

export default function Divider({ text = 'OR' }: DividerProps) {
  return (
    <View className="flex-row items-center">
      <View className="h-px flex-1 bg-brand-surface-border" />

      <Text className="mx-4 text-xs font-semibold uppercase tracking-widest text-brand-text-muted">
        {text}
      </Text>

      <View className="h-px flex-1 bg-brand-surface-border" />
    </View>
  )
}
