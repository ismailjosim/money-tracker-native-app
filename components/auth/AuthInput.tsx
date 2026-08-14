import React from 'react'
import { Text, TextInput, TextInputProps, View } from 'react-native'

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
  ...props
}: AuthInputProps) {
  return (
    <View className="mb-5">
      {label && <Text className="mb-2 text-sm font-semibold text-brand-text-primary">{label}</Text>}

      <View
        className={`h-14 flex-row items-center rounded-2xl border bg-brand-surface px-4 ${error ? 'border-brand-coral' : 'border-brand-surface-border'} ${!editable ? 'opacity-60' : ''} `}
      >
        {leftIcon && <View className="mr-3">{leftIcon}</View>}

        <TextInput
          {...props}
          editable={editable}
          placeholderTextColor="#5C5F68"
          className="flex-1 text-base text-brand-text-primary"
          cursorColor="#10B981"
          selectionColor="#10B981"
        />
      </View>

      {error ? <Text className="mt-2 text-xs font-medium text-brand-coral">{error}</Text> : null}
    </View>
  )
}
