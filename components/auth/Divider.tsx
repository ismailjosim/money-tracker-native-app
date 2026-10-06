import { Text, View } from 'react-native'

interface DividerProps {
  text?: string
}

export default function Divider({ text = 'OR' }: DividerProps) {
  return (
    <View className="flex-row items-center">
      <View className="h-px flex-1 bg-slate-200 dark:bg-brand-surface-border" />

      <Text className="mx-4 text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-brand-text-muted">
        {text}
      </Text>

      <View className="h-px flex-1 bg-slate-200 dark:bg-brand-surface-border" />
    </View>
  )
}
