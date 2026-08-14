import React from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface PrimaryButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  fullWidth?: boolean;
}

export default function PrimaryButton({
  title,
  loading = false,
  fullWidth = true,
  disabled,
  ...props
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      disabled={isDisabled}
      className={`${fullWidth ? "w-full" : ""} rounded-lg overflow-hidden ${
        isDisabled ? "opacity-50" : ""
      }`}
      {...props}
    >
      <LinearGradient
        colors={["#253BCE", "#00A896", "#84CC16"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="px-6 py-4 items-center justify-center"
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text className="text-white text-lg font-bold py-2 text-center tracking-wide">
            {title}
          </Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}
