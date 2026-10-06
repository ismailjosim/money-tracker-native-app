import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable'
import { getCategoryConfig } from '@/constants/categories'
import { Transaction } from '@/lib/services/transactions'
import { formatPrice } from '@/lib/utils/utils'
import { Camera, Mic, Edit3, Trash2, AlertTriangle } from 'lucide-react-native'

export function TransactionRow({ tx, onDelete }: { tx: Transaction; onDelete?: () => void }) {
  const config = getCategoryConfig(tx.category)
  const isIncome = tx.type === 'INCOME'

  const MethodIcon =
    tx.input_method === 'RECEIPT_SCAN' ? Camera : tx.input_method === 'VOICE' ? Mic : Edit3

  const row = (
    <View className="flex-row items-center rounded-[18px] border border-slate-200 bg-white px-3.5 py-3 shadow-sm dark:border-white/[0.06] dark:bg-[#111420]">
      {/* Category Icon with radiant translucent glow */}
      <View
        className="mr-3.5 h-12 w-12 items-center justify-center rounded-2xl border"
        style={{ backgroundColor: `${config.color}18`, borderColor: `${config.color}35` }}
      >
        <Text className="text-2xl">{config.icon}</Text>
      </View>

      {/* Description & Metadata */}
      <View className="flex-1 justify-center">
        <Text
          className="mb-1 text-sm font-semibold tracking-tight text-slate-900 dark:text-white"
          numberOfLines={1}
        >
          {tx.description || config.label}
        </Text>

        <View className="flex-row flex-wrap items-center gap-1.5">
          <View className="flex-row items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 dark:bg-white/[0.05]">
            <MethodIcon size={10} color="#94A3B8" />
            <Text className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
              {tx.input_method === 'RECEIPT_SCAN'
                ? 'AI Scan'
                : tx.input_method === 'VOICE'
                  ? 'Voice'
                  : 'Manual'}
            </Text>
          </View>

          <View
            className="rounded-md border bg-slate-50 px-2 py-0.5 dark:bg-white/[0.02]"
            style={{ borderColor: `${config.color}33` }}
          >
            <Text className="text-[10px] font-semibold" style={{ color: config.color }}>
              {config.label}
            </Text>
          </View>

          {tx.is_flagged && (
            <View className="flex-row items-center gap-1 rounded-md bg-amber-400/15 px-1.5 py-0.5">
              <AlertTriangle size={10} color="#FBBF24" />
              <Text className="text-[10px] font-semibold text-amber-500 dark:text-amber-400">
                Flagged
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Amount with high-contrast FinTech formatting */}
      <View className="ml-2.5 items-end">
        <Text
          className={`text-sm font-bold tracking-tight ${
            isIncome ? 'text-[#00E599]' : 'text-[#FF4D6D]'
          }`}
        >
          {isIncome ? '+' : '-'} {formatPrice(tx.amount)}
        </Text>
      </View>
    </View>
  )

  if (!onDelete) {
    return <View className="mb-2">{row}</View>
  }

  return (
    <View className="mb-2">
      <Swipeable
        overshootRight={false}
        renderRightActions={() => (
          <TouchableOpacity
            onPress={onDelete}
            activeOpacity={0.8}
            className="ml-2 w-16 items-center justify-center rounded-[18px] bg-[#FF4D6D] shadow-md shadow-red-500/20"
          >
            <Trash2 size={18} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      >
        {row}
      </Swipeable>
    </View>
  )
}
