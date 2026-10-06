import React from 'react'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { Camera, Mail, Sparkles } from 'lucide-react-native'

export function ProfileHeader({
  user,
  uploadingAvatar,
  onPickAvatar,
}: {
  user: {
    firstName?: string | null
    lastName?: string | null
    imageUrl?: string | null
    hasImage?: boolean
    emailAddresses?: { emailAddress: string }[]
  } | null
  uploadingAvatar: boolean
  onPickAvatar: () => void
}) {
  return (
    <View className="mb-2.5 px-4">
      <LinearGradient
        colors={['#161D2E', '#0E121D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="items-center rounded-3xl border border-white/10 px-5 py-6 shadow-2xl"
      >
        <TouchableOpacity
          onPress={onPickAvatar}
          disabled={uploadingAvatar}
          activeOpacity={0.8}
          className="relative h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-[#00E599]/40 bg-[#1E2538]"
        >
          {uploadingAvatar ? (
            <ActivityIndicator color="#00E599" />
          ) : user?.imageUrl && user.hasImage ? (
            <Image
              source={{ uri: user.imageUrl }}
              className="h-[74px] w-[74px] rounded-full"
              contentFit="cover"
            />
          ) : (
            <View className="h-[74px] w-[74px] items-center justify-center rounded-full bg-[#161B29]">
              <Text className="text-3xl font-black text-[#00E599]">
                {(user?.firstName?.[0] || 'W').toUpperCase()}
              </Text>
            </View>
          )}
          <View className="absolute bottom-0 left-0 right-0 h-5 items-center justify-center bg-black/65">
            <Camera size={11} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        <Text className="mt-3 text-lg font-bold text-white">
          {user?.firstName} {user?.lastName}
        </Text>

        <View className="mt-1 flex-row items-center gap-1.5">
          <Mail size={12} color="#94A3B8" />
          <Text className="text-xs text-slate-400" numberOfLines={1}>
            {user?.emailAddresses?.[0]?.emailAddress}
          </Text>
        </View>

        {/* Pro Tier Badge */}
        <View className="mt-3.5 flex-row items-center gap-1.5 rounded-full border border-[#00E599]/30 bg-[#00E599]/15 px-3 py-1">
          <Sparkles size={12} color="#00E599" />
          <Text className="text-[10px] font-bold tracking-wider text-[#00E599]">
            WALLEX PRO TIER
          </Text>
        </View>
      </LinearGradient>
    </View>
  )
}
