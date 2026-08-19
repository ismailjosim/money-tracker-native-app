import { onboardingSchema, OnboardingFormValues } from '@/lib/schemas/onboarding'

import { useUser } from '@clerk/expo'
import { zodResolver } from '@hookform/resolvers/zod'
import { Feather } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import useSupabase from '@/hooks/useSupabase'
import { useUserStore } from '@/store/useStore'
import { ALL_CURRENCIES, CurrencyPicker } from '@/components/Shared/CurrencyPicker'

export default function OnboardingScreen() {
  const { user } = useUser()
  const authSupabase = useSupabase()
  const setCurrency = useUserStore(s => s.setCurrency)
  const setNeedsOnboarding = useUserStore(s => s.setNeedOnboarding)

  const {
    control,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    mode: 'onBlur',
    defaultValues: { startingBalance: '' },
  })

  const [selectedCurrency, setSelectedCurrency] = useState(
    ALL_CURRENCIES.find(c => c.code === 'BDT') ??
      ALL_CURRENCIES[0] ??
      ({ code: 'USD', name: 'US Dollar', symbol: '$' } as (typeof ALL_CURRENCIES)[0])
  )
  const [pickerOpen, setPickerOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async ({ startingBalance }: OnboardingFormValues) => {
    const parsed = parseFloat(startingBalance.replace(/,/g, ''))
    setSaving(true)
    setError('')

    const { error: updateError } = await authSupabase
      .from('users')
      .update({
        currency: selectedCurrency.code,
      })
      .eq('clerk_id', user!.id)
    console.log({ updateError })
    if (updateError) {
      setSaving(false)
      setError('Something went wrong. Please try again.')
      return
    }

    const { data: defaultAccount, error: accountFetchError } = await authSupabase
      .from('accounts')
      .select('id, balance')
      .eq('user_id', user!.id)
      .eq('is_default', true)
      .single()

    if (accountFetchError || !defaultAccount) {
      setSaving(false)
      setError('Something went wrong. Please try again.')
      return
    }

    const { error: txError } = await authSupabase.from('transactions').insert({
      user_id: user!.id,
      account_id: defaultAccount.id,
      type: 'INCOME',
      amount: parsed,
      category: 'other_income',
      description: 'Starting balance',
      date: new Date().toISOString(),
      input_method: 'MANUAL',
    })

    if (txError) {
      setSaving(false)
      setError('Something went wrong. Please try again.')
      return
    }

    const { error: balanceError } = await authSupabase
      .from('accounts')
      .update({ balance: defaultAccount.balance + parsed })
      .eq('id', defaultAccount.id)

    setSaving(false)

    if (balanceError) {
      setError('Something went wrong. Please try again.')
      return
    }

    setCurrency(selectedCurrency.code)
    setNeedsOnboarding(false)
    router.replace('/(root)/(tabs)')
  }

  return (
    <SafeAreaView className="flex-1 bg-brand-body" edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="-mt-16 flex-1 justify-center px-6">
          <View className="mb-10 flex flex-col items-center justify-start">
            <Image
              source={require('../../assets/images/transparent-logo.png')}
              className="h-14 w-32"
              resizeMode="contain"
            />
            <Text className="mb-2 mt-10 text-center text-3xl font-bold text-[#1A1D26]">
              Let&apos;s get you set up
            </Text>
            <Text className="mb-10 text-center text-sm text-brand-text-muted">
              A couple of quick details to personalise your experience.
            </Text>
          </View>

          {/* Starting balance */}
          <Text className="mb-1.5 text-xs font-medium text-brand-bg">Starting balance</Text>
          <View className="mb-1 flex-row items-center rounded-xl border border-[#E8E6DF] bg-white px-4">
            <Text className="mr-2 text-sm text-brand-text-secondary">
              {selectedCurrency.symbol}
            </Text>
            <Controller
              control={control}
              name="startingBalance"
              render={({ field: { value, onChange } }) => (
                <TextInput
                  value={value}
                  onChangeText={v => {
                    setError('')
                    onChange(v)
                  }}
                  placeholder="e.g. 50000"
                  placeholderTextColor="#8A8D96"
                  keyboardType="numeric"
                  returnKeyType="done"
                  className="flex-1 py-3.5 text-sm text-brand-bg"
                />
              )}
            />
          </View>
          {formErrors.startingBalance && (
            <Text className="mb-4 text-xs text-brand-coral">
              {formErrors.startingBalance.message}
            </Text>
          )}
          <View className="mb-4" />

          {/* Currency picker */}
          <Text className="mb-1.5 text-xs font-medium text-brand-bg">Currency</Text>
          <TouchableOpacity
            onPress={() => setPickerOpen(true)}
            className="mb-6 flex-row items-center justify-between rounded-xl border border-[#E8E6DF] bg-white px-4 py-3.5"
          >
            <Text className="text-sm text-brand-bg">
              {selectedCurrency.symbol} {selectedCurrency.code} — {selectedCurrency.name}
            </Text>
            <Feather name="chevron-down" size={16} color="#8A8D96" />
          </TouchableOpacity>

          {error ? <Text className="mb-4 text-xs text-brand-coral">{error}</Text> : null}

          <TouchableOpacity
            onPress={handleSubmit(handleSave)}
            disabled={saving}
            className="items-center rounded-xl bg-brand-bg py-4"
            activeOpacity={0.85}
          >
            <Text className="text-sm font-semibold text-white">
              {saving ? 'Saving…' : 'Get started'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <CurrencyPicker
        visible={pickerOpen}
        selectedCode={selectedCurrency.code}
        onSelect={currency => {
          setSelectedCurrency(currency)
          setPickerOpen(false)
        }}
        onClose={() => setPickerOpen(false)}
      />
    </SafeAreaView>
  )
}
