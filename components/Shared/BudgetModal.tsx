import React, { useEffect, useState } from 'react'
import { Text, TextInput, TouchableOpacity, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { useUpsertBudget } from '@/hooks/mutations/useBudgetMutations'
import { Budget } from '@/lib/services/budgets'
import { FormSheetModal } from './FormSheetModal'

export function BudgetModal({
  visible,
  budget,
  onClose,
  onSaved,
}: {
  visible: boolean
  budget: Budget | null
  onClose: () => void
  onSaved: () => void
}) {
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const { mutateAsync: upsertBudget, isPending: saving } = useUpsertBudget()

  useEffect(() => {
    if (visible) {
      setAmount(budget ? String(budget.amount) : '')
      setError('')
    }
  }, [visible, budget])

  const handleSave = async () => {
    const parsedAmount = parseFloat(amount.replace(/,/g, ''))

    if (!parsedAmount || parsedAmount <= 0) {
      setError('Enter a valid monthly budget.')
      return
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {})
    setError('')
    try {
      await upsertBudget(parsedAmount)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})
      onSaved()
    } catch (err) {
      console.error('Error saving budget:', err)
      setError('Something went wrong. Please try again.')
    }
  }

  return (
    <FormSheetModal
      visible={visible}
      title={budget ? 'Edit Monthly Budget' : 'Set Monthly Budget'}
      onClose={onClose}
    >
      <Text className="mb-2 text-[11px] font-bold tracking-wider text-slate-400">BUDGET LIMIT</Text>
      <View className="mb-4 rounded-2xl border border-white/10 bg-[#161B2A] px-4 py-3.5">
        <TextInput
          value={amount}
          onChangeText={v => {
            setError('')
            setAmount(v)
          }}
          placeholder="e.g. 5000"
          placeholderTextColor="#475569"
          keyboardType="numeric"
          autoFocus
          className="p-0 text-lg font-bold text-white"
        />
      </View>

      {error ? <Text className="mb-3 text-xs text-[#FF4D6D]">{error}</Text> : null}

      <TouchableOpacity
        onPress={handleSave}
        disabled={saving}
        className="mb-2 overflow-hidden rounded-2xl shadow-lg shadow-[#00E599]/20"
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={['#00E599', '#00B4D8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="items-center justify-center py-4"
        >
          <Text className="text-sm font-bold uppercase tracking-wider text-[#08090D]">
            {saving ? 'Saving…' : 'Save Budget'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </FormSheetModal>
  )
}
