import React from 'react'
import { Text, TextInput, TouchableOpacity, View, Platform } from 'react-native'
import { Control, Controller } from 'react-hook-form'
import { AlertCircle } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import { TransactionFormValues } from '@/lib/schemas/transaction'

export function AmountCard({
  control,
  type,
  currency,
  errorMessage,
  onClearError,
  onAddAmount,
}: {
  control: Control<TransactionFormValues>
  type: 'EXPENSE' | 'INCOME'
  currency: string
  errorMessage?: string
  onClearError: () => void
  onAddAmount: (delta: number) => void
}) {
  return (
    <View
      className={`mb-4 rounded-3xl border p-5 shadow-2xl ${
        type === 'INCOME'
          ? 'border-[#00E599]/30 bg-emerald-500/10 dark:bg-[#111825]'
          : 'border-[#FF4D6D]/30 bg-rose-500/10 dark:bg-[#19121E]'
      }`}
    >
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Amount
        </Text>
        <View className="rounded-lg border border-slate-200 bg-white/70 px-2.5 py-0.5 dark:border-white/10 dark:bg-white/5">
          <Text className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
            {currency}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-center py-2">
        <Text
          className={`mr-1 text-3xl font-black ${
            type === 'INCOME' ? 'text-[#00E599]' : 'text-[#FF4D6D]'
          }`}
        >
          {type === 'INCOME' ? '+' : '-'}
        </Text>
        <Controller
          control={control}
          name="amount"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value}
              onChangeText={v => {
                onClearError()
                onChange(v)
              }}
              onBlur={onBlur}
              placeholder="0.00"
              placeholderTextColor="#475569"
              keyboardType="decimal-pad"
              className={`min-w-[160px] p-0 text-center text-4xl font-black tracking-tight outline-none focus:outline-none ${
                type === 'INCOME' ? 'text-[#00E599]' : 'text-[#FF4D6D]'
              }`}
              style={[
                {
                  textAlign: 'center',
                  fontSize: 40,
                  fontWeight: '900',
                  color: type === 'INCOME' ? '#00E599' : '#FF4D6D',
                },
                Platform.OS === 'web'
                  ? ({
                      outlineStyle: 'none',
                      outline: 'none',
                      textAlign: 'center',
                    } as any)
                  : undefined,
              ]}
            />
          )}
        />
      </View>

      {/* Quick Preset Increment Chips */}
      <View className="mt-3 flex-row justify-center gap-2 border-t border-slate-200/50 pt-3 dark:border-white/5">
        {[100, 500, 1000, 5000].map(addVal => (
          <TouchableOpacity
            key={addVal}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
              onAddAmount(addVal)
            }}
            activeOpacity={0.7}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 dark:border-white/10 dark:bg-white/5"
          >
            <Text className="text-xs font-bold text-slate-700 dark:text-slate-300">+{addVal}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {errorMessage && (
        <View className="mt-3 flex-row items-center justify-center gap-1.5 rounded-xl border border-[#FF4D6D]/30 bg-[#FF4D6D]/10 px-3 py-2">
          <AlertCircle size={13} color="#FF4D6D" />
          <Text className="text-xs font-semibold text-[#FF4D6D]">{errorMessage}</Text>
        </View>
      )}
    </View>
  )
}
