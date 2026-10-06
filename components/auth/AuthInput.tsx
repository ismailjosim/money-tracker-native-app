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
        <Text className="mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
          {label}
        </Text>
      )}

      <View
        className={`h-12 flex-row items-center rounded-2xl border bg-[#161B2A] px-3.5 transition-colors ${
          error
            ? 'border-[#FF4D6D] bg-red-500/[0.03]'
            : isFocused
              ? 'border-[#00E599] shadow-sm shadow-[#00E599]/30'
              : 'border-white/10'
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
          placeholderTextColor="#475569"
          className="flex-1 bg-transparent p-0 text-sm font-semibold text-white outline-none focus:outline-none"
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
