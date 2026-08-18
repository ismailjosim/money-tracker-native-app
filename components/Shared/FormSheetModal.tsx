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
        className="flex-1 justify-end bg-black/40"
      >
        <View className="rounded-t-2xl bg-brand-body px-5 pb-8 pt-5">
          <Text className="mb-4 text-base font-semibold text-brand-bg">{title}</Text>

          {children}

          <TouchableOpacity onPress={onClose} className="items-center py-2">
            <Text className="text-sm text-brand-text-secondary">Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}
