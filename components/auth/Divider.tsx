import { Text, View } from "react-native";

interface DividerProps {
  text?: string;
}

export default function Divider({ text = "OR" }: DividerProps) {
  return (
    <View className="flex-row items-center">
      <View className="flex-1 h-px bg-brand-surface-border" />

      <Text className="mx-4 text-xs font-semibold tracking-widest uppercase text-brand-text-muted">
        {text}
      </Text>

      <View className="flex-1 h-px bg-brand-surface-border" />
    </View>
  );
}
