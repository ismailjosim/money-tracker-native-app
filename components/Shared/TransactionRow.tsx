import { getCategoryConfig } from '@/constants/categories'
import { Transaction } from '@/lib/services/transactions'

import { Feather } from '@expo/vector-icons'
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable'
import { Text, TouchableOpacity, View } from 'react-native'
import { formatPrice } from '@/lib/utils/utils'

const INPUT_METHOD_ICON: Record<Transaction['input_method'], keyof typeof Feather.glyphMap> = {
  MANUAL: 'edit-3',
  RECEIPT_SCAN: 'camera',
  VOICE: 'mic',
}

export function TransactionRow({ tx, onDelete }: { tx: Transaction; onDelete?: () => void }) {
  const config = getCategoryConfig(tx.category)
  const isIncome = tx.type === 'INCOME'

  const row = (
    <View
      className="flex-row items-center rounded-2xl border border-[#E8E6DF] bg-white py-4 pl-3 pr-3.5"
      style={{ borderLeftWidth: 3, borderLeftColor: config.color }}
    >
      <View
        className="mr-3 h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: `${config.color}22` }}
      >
        <Text className="text-lg">{config.icon}</Text>
      </View>

      <View className="flex-1">
        <Text className="text-sm font-medium text-brand-bg" numberOfLines={1}>
          {tx.description || config.label}
        </Text>
        <View className="mt-0.5 flex-row items-center gap-1.5">
          <Feather name={INPUT_METHOD_ICON[tx.input_method]} size={11} color="#8A8D96" />
          <View
            className="rounded-full px-1.5 py-0.5"
            style={{ backgroundColor: `${config.color}1A` }}
          >
            <Text className="text-[10px] font-medium" style={{ color: config.color }}>
              {config.label}
            </Text>
          </View>
          {tx.is_flagged && (
            <View className="ml-1 flex-row items-center gap-1">
              <Feather name="alert-triangle" size={11} color="#FF6B4A" />
              <Text className="text-[11px] text-brand-coral">Flagged</Text>
            </View>
          )}
        </View>
      </View>

      <Text
        className={`text-sm font-medium ${isIncome ? 'text-brand-success' : 'text-brand-coral'}`}
      >
        {isIncome ? '+' : '-'}
        {formatPrice(tx.amount)}
      </Text>
    </View>
  )

  if (!onDelete) {
    return <View className="mb-2.5">{row}</View>
  }

  return (
    <View className="mb-2.5">
      <Swipeable
        overshootRight={false}
        renderRightActions={() => (
          <TouchableOpacity
            onPress={onDelete}
            className="ml-2 w-16 items-center justify-center rounded-2xl bg-brand-coral"
          >
            <Feather name="trash-2" size={18} color="#fff" />
          </TouchableOpacity>
        )}
      >
        {row}
      </Swipeable>
    </View>
  )
}
