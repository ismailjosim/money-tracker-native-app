import React from 'react'
import { Text, View } from 'react-native'
import { PieChart } from 'react-native-gifted-charts'
import { useAppTheme } from '@/hooks/useAppTheme'
import { getCategoryConfig } from '@/constants/categories'
import { formatPrice } from '@/lib/utils/utils'
import { Transaction } from '@/types'

export type ExpenseCategoryBreakdown = {
  category: Transaction['category']
  amount: number
  color: string
}

export function SpendingBreakdownCard({
  expenseBreakdown,
  currency,
}: {
  expenseBreakdown: ExpenseCategoryBreakdown[]
  currency: string
}) {
  const { isDark } = useAppTheme()

  if (expenseBreakdown.length === 0) return null

  return (
    <View className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-white/10 dark:bg-[#111420]">
      <Text className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300">
        Spending Breakdown
      </Text>
      <View className="flex-row items-center justify-between">
        <PieChart
          data={expenseBreakdown.map(c => ({
            value: c.amount,
            color: c.color,
          }))}
          radius={56}
          innerRadius={36}
          innerCircleColor={isDark ? '#111420' : '#FFFFFF'}
          centerLabelComponent={() => (
            <View className="items-center justify-center">
              <Text className="text-base font-black text-slate-900 dark:text-white">
                {expenseBreakdown.length}
              </Text>
              <Text className="text-[9px] text-slate-500 dark:text-slate-400">Cats</Text>
            </View>
          )}
        />

        <View className="ml-4 flex-1 gap-2">
          {expenseBreakdown.slice(0, 4).map(c => (
            <View key={c.category} className="flex-row items-center justify-between">
              <View className="mr-2 flex-1 flex-row items-center gap-2">
                <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                <Text
                  className="text-xs font-medium text-slate-700 dark:text-slate-300"
                  numberOfLines={1}
                >
                  {getCategoryConfig(c.category).label}
                </Text>
              </View>
              <Text className="text-xs font-bold text-slate-900 dark:text-white">
                {formatPrice(c.amount, currency)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}
