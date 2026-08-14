import React, { useState } from 'react'
import { Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native'
import { Eye, EyeOff, Lock } from 'lucide-react-native'

interface PasswordInputProps extends TextInputProps {
  label?: string
  error?: string
}

export default function PasswordInput({
  label,
  error,
  editable = true,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <View className="mb-5">
      {label && <Text className="mb-2 text-sm font-semibold text-brand-text-primary">{label}</Text>}

      <View
        className={`h-14 flex-row items-center rounded-2xl border bg-brand-surface px-4 ${error ? 'border-brand-coral' : 'border-brand-surface-border'} ${!editable ? 'opacity-60' : ''} `}
      >
        <Lock size={20} color="#8A8D96" />

        <TextInput
          {...props}
          editable={editable}
          secureTextEntry={!showPassword}
          placeholderTextColor="#5C5F68"
          cursorColor="#10B981"
          selectionColor="#10B981"
          className="ml-3 flex-1 text-base text-brand-text-primary"
        />

        <TouchableOpacity activeOpacity={0.7} onPress={() => setShowPassword(prev => !prev)}>
          {showPassword ? <EyeOff size={20} color="#8A8D96" /> : <Eye size={20} color="#8A8D96" />}
        </TouchableOpacity>
      </View>

      {error ? <Text className="mt-2 text-xs font-medium text-brand-coral">{error}</Text> : null}
    </View>
  )
}
