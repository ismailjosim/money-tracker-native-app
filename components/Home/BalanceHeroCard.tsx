import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { ArrowDownRight, ArrowUpRight, Eye, EyeOff, TrendingUp } from 'lucide-react-native'
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
  return (
    <View className="mb-4">
      <LinearGradient
        colors={['#161D2E', '#0E121D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-3xl border border-white/10 p-5 shadow-2xl"
      >
        <View className="mb-2 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              TOTAL NET WORTH
            </Text>
            <TouchableOpacity
              onPress={onTogglePrivacy}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {showBalance ? (
                <Eye size={14} color="#94A3B8" />
              ) : (
                <EyeOff size={14} color="#94A3B8" />
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
          <Text className="text-3xl font-black tracking-tight text-white">
            {showBalance ? formatPrice(totalBalance, currency) : '••••••••'}
          </Text>
        </View>

        {/* Financial Performance Badges */}
        <View className="mt-2 flex-row items-center justify-between rounded-2xl border border-white/[0.04] bg-black/30 p-3">
          <View className="flex-1 flex-row items-center gap-2.5">
            <View className="h-8 w-8 items-center justify-center rounded-full bg-[#00E599]/15">
              <ArrowUpRight size={14} color="#00E599" strokeWidth={2.5} />
            </View>
            <View>
              <Text className="text-[10px] font-medium text-slate-400">Income</Text>
              <Text className="text-xs font-bold text-[#00E599]">
                {showBalance ? formatPrice(monthIncome, currency) : '••••'}
              </Text>
            </View>
          </View>

          <View className="mx-2 h-7 w-[1px] bg-white/10" />

          <View className="flex-1 flex-row items-center gap-2.5">
            <View className="h-8 w-8 items-center justify-center rounded-full bg-[#FF4D6D]/15">
              <ArrowDownRight size={14} color="#FF4D6D" strokeWidth={2.5} />
            </View>
            <View>
              <Text className="text-[10px] font-medium text-slate-400">Expense</Text>
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
