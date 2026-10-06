import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { ArrowDownRight, ArrowUpRight, Eye, EyeOff, TrendingUp } from 'lucide-react-native'
import { useAppTheme } from '@/hooks/useAppTheme'
import { formatPrice } from '@/lib/utils/utils'

export function BalanceHeroCard({
  totalBalance,
  monthIncome,
  monthExpense,
  currency,
  showBalance,
  onTogglePrivacy,
}: {
  totalBalance: number
  monthIncome: number
  monthExpense: number
  currency: string
  showBalance: boolean
  onTogglePrivacy: () => void
}) {
  const { isDark } = useAppTheme()

  return (
    <View className="mb-4">
      <LinearGradient
        colors={isDark ? ['#161D2E', '#0E121D'] : ['#FFFFFF', '#F8FAFC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-3xl border border-slate-200 p-5 shadow-xl dark:border-white/10"
      >
        <View className="mb-2 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              TOTAL NET WORTH
            </Text>
            <TouchableOpacity
              onPress={onTogglePrivacy}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {showBalance ? (
                <Eye size={14} color={isDark ? '#94A3B8' : '#64748B'} />
              ) : (
                <EyeOff size={14} color={isDark ? '#94A3B8' : '#64748B'} />
              )}
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center gap-1 rounded-full border border-[#00E599]/30 bg-[#00E599]/15 px-2 py-0.5">
            <TrendingUp size={11} color="#00E599" />
            <Text className="text-[9px] font-bold text-[#00E599]">PRO</Text>
          </View>
        </View>

        {/* Total Balance Amount */}
        <View className="my-2">
          <Text className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {showBalance ? formatPrice(totalBalance, currency) : '••••••••'}
          </Text>
        </View>

        {/* Financial Performance Badges */}
        <View className="mt-2 flex-row items-center justify-between rounded-2xl border border-slate-100 bg-slate-100/70 p-3 dark:border-white/[0.04] dark:bg-black/30">
          <View className="flex-1 flex-row items-center gap-2.5">
            <View className="h-8 w-8 items-center justify-center rounded-full bg-[#00E599]/15">
              <ArrowUpRight size={14} color="#00E599" strokeWidth={2.5} />
            </View>
            <View>
              <Text className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                Income
              </Text>
              <Text className="text-xs font-bold text-[#00E599]">
                {showBalance ? formatPrice(monthIncome, currency) : '••••'}
              </Text>
            </View>
          </View>

          <View className="mx-2 h-7 w-[1px] bg-slate-200 dark:bg-white/10" />

          <View className="flex-1 flex-row items-center gap-2.5">
            <View className="h-8 w-8 items-center justify-center rounded-full bg-[#FF4D6D]/15">
              <ArrowDownRight size={14} color="#FF4D6D" strokeWidth={2.5} />
            </View>
            <View>
              <Text className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                Expense
              </Text>
              <Text className="text-xs font-bold text-[#FF4D6D]">
                {showBalance ? formatPrice(monthExpense, currency) : '••••'}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  )
}
