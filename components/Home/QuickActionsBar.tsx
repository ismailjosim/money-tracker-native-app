import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Camera, Mic, Plus } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'

const QUICK_ACTIONS = [
  {
    icon: Camera,
    label: 'AI Scan',
    sub: 'Receipts',
    action: 'scan',
    color: '#00E599',
    bgColor: 'rgba(0, 229, 153, 0.12)',
  },
  {
    icon: Mic,
    label: 'Voice AI',
    sub: 'Speak it',
    action: 'voice',
    color: '#38BDF8',
    bgColor: 'rgba(56, 189, 248, 0.12)',
  },
  {
    icon: Plus,
    label: 'Quick Add',
    sub: 'Manual',
    action: 'manual',
    color: '#A855F7',
    bgColor: 'rgba(168, 85, 247, 0.12)',
  },
] as const

export function QuickActionsBar() {
  const router = useRouter()

  return (
    <View className="mb-4 flex-row gap-2.5">
      {QUICK_ACTIONS.map(item => {
        const Icon = item.icon
        return (
          <TouchableOpacity
            key={item.label}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
              router.push({
                pathname: '/(root)/(tabs)/add-transaction',
                params: { action: item.action },
              })
            }}
            activeOpacity={0.75}
            className="flex-1 items-center rounded-2xl border border-slate-200/80 bg-white p-3 shadow-md dark:border-white/10 dark:bg-[#111420]"
          >
            <View
              className="mb-2 h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: item.bgColor }}
            >
              <Icon size={18} color={item.color} strokeWidth={2.2} />
            </View>
            <Text className="text-xs font-bold text-slate-900 dark:text-white">{item.label}</Text>
            <Text className="text-[10px] text-slate-500 dark:text-slate-400">{item.sub}</Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}
