import React, { useEffect, useState } from 'react'
import { Text, TextInput, TouchableOpacity, View, Platform } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { useUpsertBudget } from '@/hooks/mutations/useBudgetMutations'
import { Budget } from '@/lib/services/budgets'
import { FormSheetModal } from './FormSheetModal'
import { toast } from '@/store/useToastStore'

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
      toast.success(budget ? 'Budget updated' : 'Budget set successfully')
      onSaved()
    } catch (err) {
      console.error('Error saving budget:', err)
      setError('Something went wrong. Please try again.')
      toast.error('Could not save budget')
    }
  }

  return (
    <FormSheetModal
      visible={visible}
      title={budget ? 'Edit Monthly Budget' : 'Set Monthly Budget'}
      onClose={onClose}
    >
      <Text className="mb-2 text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400">
        BUDGET LIMIT
      </Text>
      <View className="mb-4 rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3.5 dark:border-white/10 dark:bg-[#161B2A]">
        <TextInput
          value={amount}
          onChangeText={v => {
            setError('')
            setAmount(v)
          }}
          placeholder="e.g. 5000"
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
          autoFocus
          className="p-0 text-lg font-bold text-slate-900 outline-none focus:outline-none dark:text-white"
          style={
            Platform.OS === 'web' ? ({ outlineStyle: 'none', outline: 'none' } as any) : undefined
          }
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
