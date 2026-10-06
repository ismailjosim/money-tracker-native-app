import React from 'react'
import { Text, View } from 'react-native'
import { Image } from 'expo-image'
import { Sparkles } from 'lucide-react-native'

interface AuthHeaderProps {
  title: string
  subtitle?: string
  showTagline?: boolean
}

export default function AuthHeader({ title, subtitle, showTagline = false }: AuthHeaderProps) {
  return (
    <View className="mb-6 items-center">
      {/* Brand Icon & Name */}
      <View className="mb-3 items-center">
        <Image
          source={require('../../assets/images/transparent-logo.png')}
          style={{ width: 54, height: 54 }}
          contentFit="contain"
          className="mb-2"
        />
        <View className="flex-row items-center gap-1.5 rounded-full border border-[#00E599]/30 bg-[#00E599]/15 px-2.5 py-0.5">
          <Sparkles size={11} color="#00E599" />
          <Text className="text-[10px] font-bold tracking-widest text-[#00E599]">WALLEX VAULT</Text>
        </View>
      </View>

      {/* Screen Title */}
      <Text className="text-center text-2xl font-black tracking-tight text-white">{title}</Text>

      {/* Subtitle */}
      {subtitle ? (
        <Text className="mt-1.5 max-w-[320px] px-4 text-center text-xs font-normal leading-4 text-slate-400">
          {subtitle}
        </Text>
      ) : null}
    </View>
  )
}
