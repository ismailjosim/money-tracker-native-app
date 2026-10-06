import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export function HomeHeader({
  user,
}: {
  user: {
    firstName?: string | null
    lastName?: string | null
    imageUrl?: string | null
    hasImage?: boolean
  } | null
}) {
  const router = useRouter()

  return (
    <View className="mb-5 flex-row items-center justify-between">
      <View className="flex-row items-center gap-2">
        <Image
          source={require('../../assets/images/transparent-logo.png')}
          className="h-8 w-20"
          contentFit="contain"
        />
        <View className="flex-row items-center gap-1 rounded-full border border-[#00E599]/25 bg-[#00E599]/10 px-2 py-0.5">
          <View className="h-1.5 w-1.5 rounded-full bg-[#00E599]" />
          <Text className="text-[9px] font-bold tracking-wider text-[#00E599]">AI ACTIVE</Text>
        </View>
      </View>

      <View className="flex-row items-center gap-2.5">
        <View className="items-end">
          <Text className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
            {getGreeting()}
          </Text>
          <Text className="text-xs font-bold text-slate-900 dark:text-white" numberOfLines={1}>
            {user?.firstName || user?.lastName
              ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
              : 'Financier'}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/(root)/(tabs)/profile')}
          activeOpacity={0.8}
          className="h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[#00E599]/30 bg-[#161B29] shadow-md shadow-[#00E599]/10"
        >
          {user?.imageUrl && user.hasImage ? (
            <Image
              source={{ uri: user.imageUrl }}
              className="h-9 w-9 rounded-full"
              contentFit="cover"
            />
          ) : (
            <View className="h-9 w-9 items-center justify-center rounded-full bg-[#161B29]">
              <Text className="text-sm font-black text-[#00E599]">
                {(user?.firstName?.[0] || 'W').toUpperCase()}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}
