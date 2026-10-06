import React from 'react'
import { Text, View } from 'react-native'
import { PieChart } from 'react-native-gifted-charts'
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
  if (expenseBreakdown.length === 0) return null

  return (
    <View className="mb-4 rounded-2xl border border-white/10 bg-[#111420] p-4 shadow-xl">
      <Text className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-300">
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
          innerCircleColor="#111420"
          centerLabelComponent={() => (
            <View className="items-center justify-center">
              <Text className="text-base font-black text-white">{expenseBreakdown.length}</Text>
              <Text className="text-[9px] text-slate-400">Cats</Text>
            </View>
          )}
        />

        <View className="ml-4 flex-1 gap-2">
          {expenseBreakdown.slice(0, 4).map(c => (
            <View key={c.category} className="flex-row items-center justify-between">
              <View className="mr-2 flex-1 flex-row items-center gap-2">
                <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                <Text className="text-xs font-medium text-slate-300" numberOfLines={1}>
                  {getCategoryConfig(c.category).label}
                </Text>
              </View>
              <Text className="text-xs font-bold text-white">
                {formatPrice(c.amount, currency)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}
