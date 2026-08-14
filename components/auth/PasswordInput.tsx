import React, { useState } from "react";
import {
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import { Eye, EyeOff, Lock } from "lucide-react-native";

interface PasswordInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export default function PasswordInput({
  label,
  error,
  editable = true,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="mb-5">
      {label && (
        <Text className="text-brand-text-primary text-sm font-semibold mb-2">
          {label}
        </Text>
      )}

      <View
        className={`
					flex-row
					items-center
					h-14
					rounded-2xl
					border
					px-4
					bg-brand-surface
					${error ? "border-brand-coral" : "border-brand-surface-border"}
					${!editable ? "opacity-60" : ""}
				`}
      >
        <Lock size={20} color="#8A8D96" />

        <TextInput
          {...props}
          editable={editable}
          secureTextEntry={!showPassword}
          placeholderTextColor="#5C5F68"
          cursorColor="#10B981"
          selectionColor="#10B981"
          className="flex-1 ml-3 text-base text-brand-text-primary"
        />

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setShowPassword((prev) => !prev)}
        >
          {showPassword ? (
            <EyeOff size={20} color="#8A8D96" />
          ) : (
            <Eye size={20} color="#8A8D96" />
          )}
        </TouchableOpacity>
      </View>

      {error ? (
        <Text className="text-brand-coral text-xs mt-2 font-medium">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
