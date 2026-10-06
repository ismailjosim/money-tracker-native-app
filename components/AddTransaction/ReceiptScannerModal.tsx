import React, { useEffect, useRef, useState } from 'react'
import { Modal, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CameraView, useCameraPermissions } from 'expo-camera'
import * as ImagePicker from 'expo-image-picker'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import {
  X,
  Zap,
  ZapOff,
  RefreshCw,
  Image as ImageIcon,
  Camera as CameraIcon,
  Sparkles,
} from 'lucide-react-native'
import { toast } from '@/store/useToastStore'

export function ReceiptScannerModal({
  visible,
  onClose,
  onCaptured,
}: {
  visible: boolean
  onClose: () => void
  onCaptured: (base64: string, mimeType: string) => void
}) {
  const cameraRef = useRef<CameraView>(null)
  const [permission, requestPermission] = useCameraPermissions()
  const [facing, setFacing] = useState<'back' | 'front'>('back')
  const [torch, setTorch] = useState(false)
  const [capturing, setCapturing] = useState(false)

  // Animated laser scan line
  const scanProgress = useSharedValue(0)

  useEffect(() => {
    if (visible) {
      scanProgress.value = withRepeat(
        withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
      if (!permission?.granted) {
        requestPermission().catch(() => {})
      }
    } else {
      scanProgress.value = 0
      setTorch(false)
    }
  }, [visible, permission?.granted, requestPermission, scanProgress])

  const laserStyle = useAnimatedStyle(() => ({
    top: `${scanProgress.value * 94}%`,
  }))

  const toggleFacing = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
    setFacing(prev => (prev === 'back' ? 'front' : 'back'))
  }

  const toggleTorch = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
    setTorch(prev => !prev)
  }

  const handleCapture = async () => {
    if (!cameraRef.current || capturing) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {})
    setCapturing(true)
    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.7,
      })
      if (photo?.base64) {
        const cleanBase64 = photo.base64.replace(/^data:image\/[a-z]+;base64,/, '')
        onCaptured(cleanBase64, 'image/jpeg')
      } else {
        toast.error('Could not capture photo. Try again.')
      }
    } catch (err) {
      console.error('Camera capture failed:', err)
      toast.error('Failed to capture photo')
    } finally {
      setCapturing(false)
    }
  }

  const handlePickFromLibrary = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
    try {
      const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (!libraryPermission.granted) {
        toast.error('Photo library access is needed to pick receipts')
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        base64: true,
      })

      if (result.canceled) return

      const asset = result.assets[0]
      if (asset?.base64) {
        const cleanBase64 = asset.base64.replace(/^data:image\/[a-z]+;base64,/, '')
        onCaptured(cleanBase64, asset.mimeType ?? 'image/jpeg')
      }
    } catch {
      toast.error('Could not load image from gallery')
    }
  }

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent>
      <View className="flex-1 bg-black">
        {/* Camera View */}
        {permission?.granted ? (
          <CameraView ref={cameraRef} style={{ flex: 1 }} facing={facing} enableTorch={torch} />
        ) : (
          <View className="flex-1 items-center justify-center bg-[#08090D] px-8">
            <CameraIcon size={48} color="#64748B" />
            <Text className="mt-4 text-center text-base font-bold text-white">
              Camera Access Required
            </Text>
            <Text className="mt-2 text-center text-xs leading-5 text-slate-400">
              Wallex needs camera access to automatically scan and extract your receipts.
            </Text>
            <TouchableOpacity
              onPress={() => requestPermission()}
              className="mt-6 rounded-2xl bg-[#00E599] px-6 py-3"
            >
              <Text className="text-xs font-bold uppercase tracking-wider text-[#08090D]">
                Enable Camera
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Viewfinder Overlay with Dark Vignette Mask */}
        <View className="pointer-events-none absolute inset-0 items-center justify-center px-8">
          <View className="relative aspect-[3/4] w-full max-w-sm overflow-hidden rounded-3xl border border-white/20">
            {/* L-shaped Corner Reticles */}
            <View className="absolute left-0 top-0 h-8 w-8 rounded-tl-2xl border-l-4 border-t-4 border-[#00E599]" />
            <View className="absolute right-0 top-0 h-8 w-8 rounded-tr-2xl border-r-4 border-t-4 border-[#00E599]" />
            <View className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-2xl border-b-4 border-l-4 border-[#00E599]" />
            <View className="absolute bottom-0 right-0 h-8 w-8 rounded-br-2xl border-b-4 border-r-4 border-[#00E599]" />

            {/* Animated Laser Scanning Line */}
            <Animated.View
              style={[laserStyle]}
              className="absolute left-0 right-0 h-1 items-center justify-center"
            >
              <LinearGradient
                colors={['transparent', '#00E599', '#00B4D8', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="h-1 w-full shadow-lg shadow-[#00E599]"
              />
            </Animated.View>

            {/* Subtle Crosshair Target in center */}
            <View className="absolute inset-0 items-center justify-center opacity-30">
              <View className="h-6 w-0.5 bg-white/60" />
              <View className="absolute h-0.5 w-6 bg-white/60" />
            </View>
          </View>

          {/* Guide text */}
          <Text className="mt-4 text-center text-xs font-medium tracking-wide text-white/80">
            Fit receipt edges inside frame • Auto-detecting total & merchant
          </Text>
        </View>

        {/* Top Controls Header */}
        <SafeAreaView className="absolute left-0 right-0 top-0" edges={['top']}>
          <View className="flex-row items-center justify-between px-5 pt-3">
            {/* Close Button */}
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              className="h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/50 backdrop-blur-md"
            >
              <X size={20} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>

            {/* AI HUD Badge */}
            <View className="flex-row items-center gap-2 rounded-full border border-[#00E599]/30 bg-[#08090D]/80 px-4 py-2 backdrop-blur-md">
              <Sparkles size={13} color="#00E599" />
              <Text className="text-[11px] font-bold tracking-wider text-[#00E599]">
                AI SMART SCAN
              </Text>
              <View className="h-1.5 w-1.5 rounded-full bg-[#00E599]" />
            </View>

            {/* Torch Toggle */}
            <TouchableOpacity
              onPress={toggleTorch}
              activeOpacity={0.7}
              className={`h-11 w-11 items-center justify-center rounded-full border border-white/10 backdrop-blur-md ${
                torch ? 'bg-[#00E599]' : 'bg-black/50'
              }`}
            >
              {torch ? (
                <Zap size={20} color="#08090D" strokeWidth={2.5} fill="#08090D" />
              ) : (
                <ZapOff size={20} color="#FFFFFF" strokeWidth={2.2} />
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Bottom Shutter & Controls Dock */}
        <SafeAreaView className="absolute bottom-0 left-0 right-0" edges={['bottom']}>
          <View className="mx-5 mb-5 flex-row items-center justify-between rounded-3xl border border-white/10 bg-[#08090D]/80 px-6 py-4 backdrop-blur-xl">
            {/* Gallery Upload */}
            <TouchableOpacity
              onPress={handlePickFromLibrary}
              disabled={capturing}
              activeOpacity={0.7}
              className="items-center justify-center"
            >
              <View className="h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                <ImageIcon size={22} color="#FFFFFF" />
              </View>
              <Text className="mt-1 text-[10px] font-semibold tracking-wider text-slate-400">
                GALLERY
              </Text>
            </TouchableOpacity>

            {/* Pro Shutter Button */}
            <TouchableOpacity
              onPress={handleCapture}
              disabled={capturing || !permission?.granted}
              activeOpacity={0.8}
              className="items-center justify-center"
            >
              <View className="h-20 w-20 items-center justify-center rounded-full border-4 border-[#00E599]/50 bg-black/30 p-1">
                <LinearGradient
                  colors={['#00E599', '#00B4D8']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="h-full w-full items-center justify-center rounded-full shadow-lg shadow-[#00E599]"
                >
                  {capturing ? (
                    <ActivityIndicator color="#08090D" size="small" />
                  ) : (
                    <CameraIcon size={26} color="#08090D" strokeWidth={2.6} />
                  )}
                </LinearGradient>
              </View>
            </TouchableOpacity>

            {/* Flip Camera */}
            <TouchableOpacity
              onPress={toggleFacing}
              disabled={capturing}
              activeOpacity={0.7}
              className="items-center justify-center"
            >
              <View className="h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                <RefreshCw size={20} color="#FFFFFF" />
              </View>
              <Text className="mt-1 text-[10px] font-semibold tracking-wider text-slate-400">
                FLIP
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Capturing Processing Overlay */}
        {capturing && (
          <View className="absolute inset-0 z-50 items-center justify-center bg-black/70 backdrop-blur-md">
            <View className="items-center gap-3 rounded-3xl border border-white/10 bg-[#111420] p-6 shadow-2xl">
              <ActivityIndicator size="large" color="#00E599" />
              <Text className="text-sm font-bold text-white">Analyzing Receipt...</Text>
              <Text className="text-xs text-slate-400">AI is reading items, totals & date</Text>
            </View>
          </View>
        )}
      </View>
    </Modal>
  )
}
