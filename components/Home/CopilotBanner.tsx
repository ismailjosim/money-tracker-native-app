import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { ArrowRight, Sparkles } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'

export function CopilotBanner() {
  const router = useRouter()

  return (
    <TouchableOpacity
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
        router.push('/(root)/(tabs)/assistant')
      }}
      activeOpacity={0.85}
      className="mb-4 overflow-hidden rounded-2xl border border-[#00D2FF]/20"
    >
      <LinearGradient
        colors={['rgba(59, 130, 246, 0.15)', 'rgba(168, 85, 247, 0.1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-row items-center gap-3 p-3.5"
      >
        <View className="h-8 w-8 items-center justify-center rounded-full border border-[#00E599]/40 bg-[#00E599]/20">
          <Sparkles size={16} color="#00E599" />
        </View>
        <View className="flex-1">
          <Text className="text-xs font-bold tracking-wide text-white">Wallex Copilot</Text>
          <Text className="text-[11px] text-slate-300">
            Ask AI: &quot;Analyze my spending trends this month&quot;
          </Text>
        </View>
        <ArrowRight size={16} color="#94A3B8" />
      </LinearGradient>
    </TouchableOpacity>
  )
}
