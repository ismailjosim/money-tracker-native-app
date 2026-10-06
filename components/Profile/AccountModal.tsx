import React, { useEffect, useState } from 'react'
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import {
  useCreateAccount,
  useDeleteAccount,
  useUpdateAccount,
} from '@/hooks/mutations/useAccountMutations'
import { Account, AccountType } from '@/lib/services/accounts'
import { FormSheetModal } from '../Shared/FormSheetModal'

const ACCOUNT_TYPES: AccountType[] = ['CASH', 'BANK', 'CREDIT_CARD', 'SAVINGS']

const ACCOUNT_TYPE_LABEL: Record<AccountType, string> = {
  CASH: 'Cash',
  BANK: 'Bank Account',
  CREDIT_CARD: 'Credit Card',
  SAVINGS: 'Savings Vault',
}

export function AccountModal({
  visible,
  account,
  onClose,
  onSaved,
  onDeleted,
  onMadeDefault,
}: {
  visible: boolean
  account: Account | null
  onClose: () => void
  onSaved: () => void
  onDeleted: () => void
  onMadeDefault: () => void
}) {
  const isEditing = !!account
  const [name, setName] = useState('')
  const [type, setType] = useState<AccountType>('CASH')
  const [error, setError] = useState('')

  const { mutateAsync: createAccount, isPending: creating } = useCreateAccount()
  const { mutateAsync: updateAccount, isPending: updating } = useUpdateAccount()
  const { mutateAsync: deleteAccount } = useDeleteAccount()

  const saving = creating || updating

  useEffect(() => {
    if (visible) {
      setName(account?.name ?? '')
      setType(account?.type ?? 'CASH')
      setError('')
    }
  }, [visible, account])

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Please enter an account name.')
      return
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {})
    setError('')
    try {
      if (isEditing) {
        await updateAccount({ accountId: account.id, payload: { name: name.trim(), type } })
      } else {
        await createAccount({ name: name.trim(), type })
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})
      onSaved()
    } catch {
      setError('Something went wrong. Please try again.')
    }
  }

  const handleDelete = async () => {
    if (!account) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {})
    try {
      const result = await deleteAccount({ accountId: account.id })
      if (result.deleted) {
        onDeleted()
        return
      }

      Alert.alert(
        'Delete account',
        `This will also delete ${result.transactionCount} transaction${
          result.transactionCount === 1 ? '' : 's'
        }. This can't be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteAccount({ accountId: account.id, force: true })
                onDeleted()
              } catch {
                Alert.alert('Error', "Couldn't delete the account.")
              }
            },
          },
        ]
      )
    } catch {
      Alert.alert('Error', "Couldn't check the account's transactions.")
    }
  }

  return (
    <FormSheetModal
      visible={visible}
      title={isEditing ? 'Edit Account' : 'Add New Account'}
      onClose={onClose}
    >
      <Text className="mb-2 text-[11px] font-bold tracking-wider text-slate-400">ACCOUNT NAME</Text>
      <View className="mb-4 rounded-2xl border border-white/10 bg-[#161B2A] px-4 py-3.5">
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Chase Sapphire / Cash"
          placeholderTextColor="#475569"
          className="p-0 text-base font-semibold text-white"
        />
      </View>

      <Text className="mb-2 text-[11px] font-bold tracking-wider text-slate-400">ACCOUNT TYPE</Text>
      <View className="mb-4 flex-row flex-wrap gap-2">
        {ACCOUNT_TYPES.map(t => {
          const isSelected = type === t
          return (
            <TouchableOpacity
              key={t}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
                setType(t)
              }}
              activeOpacity={0.7}
              className={`rounded-xl border px-3.5 py-2.5 ${
                isSelected ? 'border-[#00E599] bg-[#00E599]' : 'border-white/10 bg-[#161B2A]'
              }`}
            >
              <Text
                className={`text-xs ${
                  isSelected ? 'font-bold text-[#08090D]' : 'font-semibold text-slate-400'
                }`}
              >
                {ACCOUNT_TYPE_LABEL[t]}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>

      {error ? <Text className="mb-3 text-xs text-[#FF4D6D]">{error}</Text> : null}

      <TouchableOpacity
        onPress={handleSave}
        disabled={saving}
        className="mb-2 mt-1 overflow-hidden rounded-2xl shadow-lg shadow-[#00E599]/20"
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={['#00E599', '#00B4D8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="items-center justify-center py-4"
        >
          <Text className="text-sm font-bold uppercase tracking-wider text-[#08090D]">
            {saving ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Account'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      {isEditing && !account.is_default && (
        <TouchableOpacity onPress={onMadeDefault} className="items-center py-2.5">
          <Text className="text-xs font-semibold text-sky-400">Set as Default Account</Text>
        </TouchableOpacity>
      )}

      {isEditing && (
        <TouchableOpacity onPress={handleDelete} className="items-center py-2.5">
          <Text className="text-xs font-semibold text-[#FF4D6D]">Delete Account</Text>
        </TouchableOpacity>
      )}
    </FormSheetModal>
  )
}
