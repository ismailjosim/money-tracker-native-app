import React from 'react'
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { Trash2, AlertTriangle, LogOut } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  destructive = true,
  icon = 'trash',
  loading = false,
  onConfirm,
  onCancel,
}: {
  visible: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  destructive?: boolean
  icon?: 'trash' | 'alert' | 'logout'
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  const IconComponent = icon === 'logout' ? LogOut : icon === 'alert' ? AlertTriangle : Trash2

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onCancel}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 items-center justify-center bg-black/80 px-6 backdrop-blur-md"
      >
        <View className="w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-[#131722] p-6 shadow-2xl shadow-black">
          {/* Glowing Icon Header */}
          <View className="mb-4 items-center">
            <View
              className={`h-14 w-14 items-center justify-center rounded-2xl border ${
                destructive
                  ? 'border-[#FF4D6D]/30 bg-[#FF4D6D]/15 shadow-lg shadow-[#FF4D6D]/20'
                  : 'border-[#00E599]/30 bg-[#00E599]/15 shadow-lg shadow-[#00E599]/20'
              }`}
            >
              <IconComponent
                size={26}
                color={destructive ? '#FF4D6D' : '#00E599'}
                strokeWidth={2.2}
              />
            </View>
          </View>

          {/* Title & Message */}
          <Text className="text-center text-lg font-black tracking-tight text-white">{title}</Text>
          <Text className="mb-6 mt-2 text-center text-xs leading-5 text-slate-400">{message}</Text>

          {/* Action Buttons */}
          <View className="gap-2.5">
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {})
                onConfirm()
              }}
              disabled={loading}
              activeOpacity={0.8}
              className={`items-center justify-center rounded-2xl py-3.5 shadow-lg ${
                destructive ? 'bg-[#FF4D6D]' : 'bg-[#00E599]'
              }`}
            >
              {loading ? (
                <ActivityIndicator color="#08090D" size="small" />
              ) : (
                <Text className="text-xs font-black uppercase tracking-wider text-[#08090D]">
                  {confirmText}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
                onCancel()
              }}
              disabled={loading}
              activeOpacity={0.7}
              className="items-center justify-center rounded-2xl border border-white/10 bg-white/5 py-3.5"
            >
              <Text className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {cancelText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}
