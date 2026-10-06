import React, { useEffect } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react-native'
import { useToastStore } from '@/store/useToastStore'

export function ProToast() {
  const insets = useSafeAreaInsets()
  const { visible, message, type, hideToast } = useToastStore()

  useEffect(() => {
    if (visible) {
      if (type === 'success') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})
      } else if (type === 'error') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {})
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
      }
    }
  }, [visible, type])

  if (!visible) return null

  const isSuccess = type === 'success'
  const isError = type === 'error'

  const IconComponent = isSuccess ? CheckCircle2 : isError ? AlertCircle : Info
  const accentColor = isSuccess ? '#00E599' : isError ? '#FF4D6D' : '#00D2FF'

  return (
    <View
      className="absolute left-0 right-0 z-50 items-center px-4"
      style={{ top: Math.max(insets.top + 8, 16) }}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={hideToast}
        className="max-w-sm flex-row items-center gap-2.5 rounded-full border border-white/10 bg-[#111420]/95 px-4 py-3 shadow-2xl backdrop-blur-xl"
        style={{
          shadowColor: accentColor,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 12,
          elevation: 10,
        }}
      >
        <View
          className="h-6 w-6 items-center justify-center rounded-full"
          style={{ backgroundColor: `${accentColor}20` }}
        >
          <IconComponent size={14} color={accentColor} strokeWidth={2.5} />
        </View>

        <Text className="flex-1 text-xs font-bold tracking-wide text-white" numberOfLines={2}>
          {message}
        </Text>

        <TouchableOpacity onPress={hideToast} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <X size={14} color="#94A3B8" />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  )
}
