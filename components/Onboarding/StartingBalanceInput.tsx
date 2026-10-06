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
      <Text className="mb-2 text-[11px] font-bold tracking-wider text-slate-400">
        STARTING BALANCE
      </Text>
      <View
        className={`flex-row items-center rounded-2xl border bg-[#161B2A] px-4 py-3 transition-colors ${
          isFocused ? 'border-[#00E599] shadow-md shadow-[#00E599]/30' : 'border-white/10'
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
              placeholderTextColor="#475569"
              keyboardType="numeric"
              returnKeyType="done"
              className="flex-1 p-0 text-2xl font-black text-white outline-none focus:outline-none"
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
