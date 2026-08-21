import { AI_GRADIENT, COLORS } from '@/constants/theme'
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons'
import { CameraView, useCameraPermissions } from 'expo-camera'
import * as ImagePicker from 'expo-image-picker'
import { useEffect, useRef, useState } from 'react'
import { Modal, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { GradientIconButton } from './GradientIconButton'

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
  const [capturing, setCapturing] = useState(false)

  useEffect(() => {
    if (visible && !permission?.granted) requestPermission()
  }, [visible, permission?.granted, requestPermission])

  const handleCapture = async () => {
    if (!cameraRef.current || capturing) return
    setCapturing(true)
    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.6,
      })
      if (photo?.base64) onCaptured(photo.base64, 'image/jpeg')
    } catch (err) {
      console.error('Camera capture failed:', err)
    } finally {
      setCapturing(false)
    }
  }

  const handlePickFromLibrary = async () => {
    const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!libraryPermission.granted) return

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      base64: true,
    })
    if (result.canceled) return

    const asset = result.assets[0]
    if (asset.base64) onCaptured(asset.base64, asset.mimeType ?? 'image/jpeg')
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View className="flex-1 bg-black">
        {permission?.granted && <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />}

        {/* Scan-frame overlay */}
        <View className="absolute inset-0 items-center justify-center px-10">
          <View
            className="aspect-[3/4] w-full rounded-2xl border-2 border-white/70"
            style={{ borderStyle: 'dashed' }}
          />
        </View>

        <SafeAreaView className="absolute inset-0" edges={['top', 'bottom']}>
          <View className="flex-row items-center justify-between px-5 pt-3">
            <TouchableOpacity
              onPress={onClose}
              className="h-10 w-10 items-center justify-center rounded-full bg-black/40"
            >
              <Feather name="x" size={18} color="#fff" />
            </TouchableOpacity>
            <View className="flex-row items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5">
              <MaterialCommunityIcons name="robot-outline" size={12} color={COLORS.teal} />
              <Text className="text-[11px] font-medium text-white">Align the receipt</Text>
            </View>
            <View className="h-10 w-10" />
          </View>

          <View className="flex-1" />

          <View className="flex-row items-center justify-between px-10 pb-6">
            <TouchableOpacity
              onPress={handlePickFromLibrary}
              disabled={capturing}
              className="h-12 w-12 items-center justify-center rounded-full bg-black/40"
            >
              <Feather name="image" size={18} color="#fff" />
            </TouchableOpacity>

            <GradientIconButton
              icon="camera"
              colors={[AI_GRADIENT[1], AI_GRADIENT[0]]}
              size={72}
              iconSize={26}
              loading={capturing}
              disabled={!permission?.granted}
              borderColor="rgba(255,255,255,0.85)"
              onPress={handleCapture}
            />

            <View className="h-12 w-12" />
          </View>
        </SafeAreaView>

        {!permission?.granted && permission?.canAskAgain === false && (
          <View className="absolute inset-0 items-center justify-center bg-black/80 px-10">
            <Feather name="camera-off" size={32} color="#8A8D96" />
            <Text className="mt-3 text-center text-sm text-white/70">
              Camera access is off. Enable it in Settings to scan receipts.
            </Text>
            <TouchableOpacity onPress={onClose} className="mt-6">
              <Text className="text-sm font-medium text-white">Close</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  )
}
