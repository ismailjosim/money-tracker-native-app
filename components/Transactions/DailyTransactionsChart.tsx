import React, { useMemo } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { eachDayOfInterval, format, startOfDay, startOfMonth } from 'date-fns'
import { BarChart } from 'react-native-gifted-charts'
import { Transaction } from '@/types'

const dayKey = (date: Date) => {
  return format(date, 'yyyy-MM-dd')
}

function currentMonthDays() {
  const today = startOfDay(new Date())
  return eachDayOfInterval({ start: startOfMonth(today), end: today }).map(d => ({
    key: dayKey(d),
    label: format(d, 'd MMM'),
  }))
}

export function DailyTransactionsChart({ transactions }: { transactions: Transaction[] }) {
  const dailyIncomeExpense = useMemo(() => {
    const days = currentMonthDays()
    return days.flatMap(({ key, label }) => {
      const income = transactions
        .filter(tx => tx.type === 'INCOME' && dayKey(new Date(tx.date)) === key)
        .reduce((sum, tx) => sum + tx.amount, 0)
      const expense = transactions
        .filter(tx => tx.type === 'EXPENSE' && dayKey(new Date(tx.date)) === key)
        .reduce((sum, tx) => sum + tx.amount, 0)
      return [
        { value: income, label, frontColor: '#00E599' },
        { value: expense, frontColor: '#FF4D6D' },
      ]
    })
  }, [transactions])

  const hasData = dailyIncomeExpense.some(d => d.value > 0)
  if (!hasData) return null

  return (
    <View className="mb-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xl dark:border-white/10 dark:bg-[#111420]">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300">
          Monthly Flow (Income vs Expense)
        </Text>
        <View className="flex-row items-center gap-3">
          <View className="flex-row items-center gap-1.5">
            <View className="h-2 w-2 rounded-full bg-[#00E599]" />
            <Text className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
              Income
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View className="h-2 w-2 rounded-full bg-[#FF4D6D]" />
            <Text className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
              Expense
            </Text>
          </View>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <BarChart
          data={dailyIncomeExpense}
          barWidth={10}
          spacing={14}
          roundedTop
          hideRules
          xAxisThickness={1}
          yAxisThickness={0}
          xAxisColor="rgba(255,255,255,0.08)"
          yAxisTextStyle={{ color: '#64748B', fontSize: 9 }}
          xAxisLabelTextStyle={{ color: '#64748B', fontSize: 8 }}
          isThreeD={false}
        />
      </ScrollView>
    </View>
  )
}
