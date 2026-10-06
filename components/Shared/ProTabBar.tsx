import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { Home, ArrowLeftRight, Plus, Sparkles, User } from 'lucide-react-native'

export function ProTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()

  return (
    <View
      className="absolute bottom-0 left-0 right-0 bg-transparent px-4"
      style={{ paddingBottom: Math.max(insets.bottom, 12) }}
      pointerEvents="box-none"
    >
      <View className="flex-row items-center justify-between rounded-[28px] border border-slate-200/90 bg-white/95 px-2.5 py-2 shadow-2xl dark:border-white/10 dark:bg-[#0F131E]">
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key]
          const isFocused = state.index === index

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            })

            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params)
            }
          }

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            })
          }

          // Center Action Button (Add Transaction)
          if (route.name === 'add-transaction') {
            return (
              <View key={route.key} className="-mt-5 flex-1 items-center justify-center">
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  className="rounded-full shadow-lg shadow-[#00E599]/40"
                >
                  <LinearGradient
                    colors={['#00E599', '#00B4D8']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="h-12 w-12 items-center justify-center rounded-full border-2 border-white dark:border-[#08090D]"
                  >
                    <Plus size={24} color="#08090D" strokeWidth={2.75} />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )
          }

          // Regular Tab Items
          let IconComponent = Home
          let label = 'Home'

          if (route.name === 'index') {
            IconComponent = Home
            label = 'Home'
          } else if (route.name === 'transactions') {
            IconComponent = ArrowLeftRight
            label = 'Activity'
          } else if (route.name === 'assistant') {
            IconComponent = Sparkles
            label = 'Copilot'
          } else if (route.name === 'profile') {
            IconComponent = User
            label = 'Profile'
          }

          const activeColor = '#00E599'
          const inactiveColor = '#64748B'
          const iconColor = isFocused ? activeColor : inactiveColor

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              className="relative flex-1 items-center justify-center py-1"
              activeOpacity={0.7}
            >
              <View className={`h-7 items-center justify-center ${isFocused ? 'scale-105' : ''}`}>
                <IconComponent size={20} color={iconColor} strokeWidth={isFocused ? 2.3 : 1.8} />
              </View>

              <Text
                className={`mt-0.5 text-[10px] tracking-tight ${
                  isFocused
                    ? 'font-semibold text-[#00E599]'
                    : 'font-medium text-slate-500 dark:text-slate-400'
                }`}
              >
                {label}
              </Text>

              {isFocused && (
                <View className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-[#00E599]" />
              )}
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}
