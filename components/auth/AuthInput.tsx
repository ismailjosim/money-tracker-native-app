import React, { useState } from 'react'
import { Text, TextInput, TextInputProps, View, Platform } from 'react-native'

interface AuthInputProps extends TextInputProps {
  label?: string
  error?: string
  leftIcon?: React.ReactNode
}

export default function AuthInput({
  label,
  error,
  leftIcon,
  editable = true,
  onFocus,
  onBlur,
  ...props
}: AuthInputProps) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <View className="mb-4">
      {label && (
        <Text className="mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </Text>
      )}

      <View
        className={`h-12 flex-row items-center rounded-2xl border px-3.5 transition-colors ${
          error
            ? 'border-[#FF4D6D] bg-red-500/[0.03]'
            : isFocused
              ? 'border-[#00E599] bg-slate-100 shadow-sm shadow-[#00E599]/30 dark:bg-[#161B2A]'
              : 'border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-[#161B2A]'
        } ${!editable ? 'opacity-50' : ''}`}
      >
        {leftIcon && <View className="mr-2.5">{leftIcon}</View>}

        <TextInput
          {...props}
          editable={editable}
          onFocus={e => {
            setIsFocused(true)
            onFocus?.(e)
          }}
          onBlur={e => {
            setIsFocused(false)
            onBlur?.(e)
          }}
          placeholderTextColor="#94A3B8"
          className="flex-1 bg-transparent p-0 text-sm font-semibold text-slate-900 outline-none focus:outline-none dark:text-white"
          style={
            Platform.OS === 'web' ? ({ outlineStyle: 'none', outline: 'none' } as any) : undefined
          }
          cursorColor="#00E599"
          selectionColor="#00E599"
        />
      </View>

      {error ? <Text className="ml-1 mt-1 text-xs font-medium text-[#FF4D6D]">{error}</Text> : null}
    </View>
  )
}
