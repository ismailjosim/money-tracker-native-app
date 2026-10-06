import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { Edit2 } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import { formatPrice } from '@/lib/utils/utils'
import { Budget } from '@/lib/services/budgets'

export function BudgetSummaryCard({
  budget,
  monthExpense,
  currency,
  onOpenModal,
}: {
  budget: Budget | null
  monthExpense: number
  currency: string
  onOpenModal: () => void
}) {
  const percentUsed = budget ? Math.min(Math.round((monthExpense / budget.amount) * 100), 100) : 0

  return (
    <TouchableOpacity
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
        onOpenModal()
      }}
      activeOpacity={0.85}
      className="mb-4 rounded-2xl border border-white/10 bg-[#111420] p-4 shadow-xl"
    >
      <View className="mb-3 flex-row items-center justify-between">
        <View>
          <Text className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Monthly Budget
          </Text>
          {budget ? (
            <Text className="mt-0.5 text-xs text-slate-400">
              {formatPrice(monthExpense, currency)} spent of {formatPrice(budget.amount, currency)}
            </Text>
          ) : (
            <Text className="mt-0.5 text-xs text-slate-400">
              Set a limit to automatically track caps
            </Text>
          )}
        </View>
        <View className="flex-row items-center gap-1 rounded-full border border-[#00E599]/30 bg-[#00E599]/15 px-2.5 py-1">
          <Edit2 size={11} color="#00E599" />
          <Text className="text-[10px] font-bold text-[#00E599]">{budget ? 'Adjust' : 'Set'}</Text>
        </View>
      </View>

      {budget && (
        <View>
          <View className="mb-2 h-2 overflow-hidden rounded-full bg-slate-800">
            <View
              className="h-full rounded-full"
              style={{
                width: `${percentUsed}%`,
                backgroundColor:
                  monthExpense >= budget.amount
                    ? '#FF4D6D'
                    : monthExpense >= budget.amount * 0.8
                      ? '#FBBF24'
                      : '#00E599',
              }}
            />
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-[10px] font-bold text-slate-300">
              {Math.round((monthExpense / budget.amount) * 100)}% Used
            </Text>
            <Text className="text-[10px] font-medium text-slate-400">
              {budget.amount - monthExpense > 0
                ? `${formatPrice(budget.amount - monthExpense, currency)} left`
                : 'Budget exceeded'}
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  )
}
