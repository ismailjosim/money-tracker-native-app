import React, { useState } from 'react'
import { Text, TextInput, View, Platform } from 'react-native'
import { Control, Controller } from 'react-hook-form'
import { OnboardingFormValues } from '@/lib/schemas/onboarding'

export function StartingBalanceInput({
  control,
  symbol,
  errorMessage,
  onClearError,
}: {
  control: Control<OnboardingFormValues>
  symbol: string
  errorMessage?: string
  onClearError: () => void
}) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <View>
      <Text className="mb-2 text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400">
        STARTING BALANCE
      </Text>
      <View
        className={`flex-row items-center rounded-2xl border px-4 py-3 transition-colors ${
          isFocused
            ? 'border-[#00E599] bg-slate-100 shadow-md shadow-[#00E599]/30 dark:bg-[#161B2A]'
            : 'border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-[#161B2A]'
        }`}
      >
        <Text className="mr-2 text-xl font-bold text-[#00E599]">{symbol}</Text>
        <Controller
          control={control}
          name="startingBalance"
          render={({ field: { value, onChange } }) => (
            <TextInput
              value={value}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChangeText={v => {
                onClearError()
                onChange(v)
              }}
              placeholder="0.00"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              returnKeyType="done"
              className="flex-1 p-0 text-2xl font-black text-slate-900 outline-none focus:outline-none dark:text-white"
              style={
                Platform.OS === 'web'
                  ? ({ outlineStyle: 'none', outline: 'none' } as any)
                  : undefined
              }
            />
          )}
        />
      </View>
      {errorMessage && (
        <Text className="ml-1 mt-1.5 text-xs font-medium text-[#FF4D6D]">{errorMessage}</Text>
      )}
    </View>
  )
}
