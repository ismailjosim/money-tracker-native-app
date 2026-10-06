import React, { useState } from 'react'
import { Text, TextInput, TextInputProps, TouchableOpacity, View, Platform } from 'react-native'
import { Eye, EyeOff, Lock } from 'lucide-react-native'

interface PasswordInputProps extends TextInputProps {
  label?: string
  error?: string
}

export default function PasswordInput({
  label,
  error,
  editable = true,
  onFocus,
  onBlur,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)
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
        <Lock size={16} color={isFocused ? '#00E599' : '#64748B'} className="mr-2.5" />

        <TextInput
          {...props}
          editable={editable}
          secureTextEntry={!showPassword}
          onFocus={e => {
            setIsFocused(true)
            onFocus?.(e)
          }}
          onBlur={e => {
            setIsFocused(false)
            onBlur?.(e)
          }}
          placeholderTextColor="#475569"
          cursorColor="#00E599"
          selectionColor="#00E599"
          className="flex-1 bg-transparent p-0 text-sm font-semibold text-white outline-none focus:outline-none"
          style={
            Platform.OS === 'web' ? ({ outlineStyle: 'none', outline: 'none' } as any) : undefined
          }
        />

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setShowPassword(prev => !prev)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="ml-2"
        >
          {showPassword ? <EyeOff size={16} color="#94A3B8" /> : <Eye size={16} color="#94A3B8" />}
        </TouchableOpacity>
      </View>

      {error ? <Text className="ml-1 mt-1 text-xs font-medium text-[#FF4D6D]">{error}</Text> : null}
    </View>
  )
}
