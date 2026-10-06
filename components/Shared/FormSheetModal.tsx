import React from 'react'
import { KeyboardAvoidingView, Modal, Platform, Text, TouchableOpacity, View } from 'react-native'

export function FormSheetModal({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-end bg-black/75"
      >
        <View className="rounded-t-[28px] border-x border-t border-white/10 bg-[#111420] px-5 pb-9 pt-3">
          <View className="mb-4 h-1 w-9 self-center rounded-full bg-white/20" />
          <Text className="mb-4 text-lg font-bold text-white">{title}</Text>

          {children}

          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.7}
            className="mt-2 items-center py-3"
          >
            <Text className="text-sm font-medium text-slate-400">Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}
