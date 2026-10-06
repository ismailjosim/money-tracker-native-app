import React, { useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { useUser } from '@clerk/expo'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { AlertTriangle, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react-native'

import useSupabase from '@/hooks/useSupabase'
import { OnboardingFormValues, onboardingSchema } from '@/lib/schemas/onboarding'
import { useUserStore } from '@/store/useStore'
import { ALL_CURRENCIES, CurrencyPicker } from '@/components/Shared/CurrencyPicker'
import { CurrencySelectorCard } from '@/components/Onboarding/CurrencySelectorCard'
import { StartingBalanceInput } from '@/components/Onboarding/StartingBalanceInput'

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
    ALL_CURRENCIES.find(c => c.code === 'USD') ??
      ALL_CURRENCIES[0] ??
      ({ code: 'USD', name: 'US Dollar', symbol: '$' } as (typeof ALL_CURRENCIES)[0])
  )
  const [pickerOpen, setPickerOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [isDbOffline, setIsDbOffline] = useState(false)

  const proceedLocally = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})
    setCurrency(selectedCurrency.code)
    setNeedsOnboarding(false)
    router.replace('/(root)/(tabs)')
  }

  const handleSave = async ({ startingBalance }: OnboardingFormValues) => {
    const parsed = parseFloat(startingBalance.replace(/,/g, '')) || 0
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {})
    setSaving(true)
    setError('')
    setIsDbOffline(false)

    try {
      const { error: updateError } = await authSupabase
        .from('users')
        .update({
          currency: selectedCurrency.code,
        })
        .eq('clerk_id', user?.id ?? '')

      if (updateError) {
        const isNetworkOrFetchError =
          updateError.message?.toLowerCase().includes('failed to fetch') ||
          updateError.message?.toLowerCase().includes('network') ||
          !updateError.code
        setSaving(false)
        if (isNetworkOrFetchError) {
          setIsDbOffline(true)
          setError(
            'Unable to connect to Supabase database. Your Supabase project may be paused or unreachable.'
          )
        } else {
          setError(updateError.message || 'Something went wrong updating user settings.')
        }
        return
      }

      const { data: defaultAccount, error: accountFetchError } = await authSupabase
        .from('accounts')
        .select('id, balance')
        .eq('user_id', user?.id ?? '')
        .eq('is_default', true)
        .single()

      if (accountFetchError || !defaultAccount) {
        const { data: createdAccount } = await authSupabase
          .from('accounts')
          .insert({
            user_id: user?.id,
            name: 'Primary Checking',
            type: 'BANK',
            balance: parsed,
            is_default: true,
          })
          .select('id')
          .single()

        if (parsed > 0 && createdAccount) {
          await authSupabase.from('transactions').insert({
            user_id: user?.id,
            account_id: createdAccount.id,
            type: 'INCOME',
            amount: parsed,
            category: 'other_income',
            description: 'Opening Balance',
            date: new Date().toISOString(),
          })
        }
      } else {
        await authSupabase.from('accounts').update({ balance: parsed }).eq('id', defaultAccount.id)

        if (parsed > 0) {
          await authSupabase.from('transactions').insert({
            user_id: user?.id,
            account_id: defaultAccount.id,
            type: 'INCOME',
            amount: parsed,
            category: 'other_income',
            description: 'Opening Balance',
            date: new Date().toISOString(),
          })
        }
      }

      proceedLocally()
    } catch (err: any) {
      setSaving(false)
      const msg = err?.message?.toLowerCase() || ''
      if (
        msg.includes('failed to fetch') ||
        msg.includes('network') ||
        msg.includes('load failed')
      ) {
        setIsDbOffline(true)
        setError('Database connection timed out or is currently unreachable.')
      } else {
        setError(err?.message || 'Something went wrong. Please try again.')
      }
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-[#08090D]" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <View className="flex-1 justify-center px-5 py-6">
          {/* Logo & Welcome Header */}
          <View className="mb-6 items-center">
            <Image
              source={require('../../assets/images/transparent-logo.png')}
              className="mb-4 h-10 w-24"
              contentFit="contain"
            />
            <View className="mb-3 flex-row items-center gap-1.5 rounded-full border border-[#00E599]/30 bg-[#00E599]/15 px-3 py-1">
              <Sparkles size={12} color="#00E599" />
              <Text className="text-[10px] font-bold tracking-widest text-[#00E599]">
                INITIALIZE WALLEX
              </Text>
            </View>
            <Text className="mb-2 text-center text-2xl font-black tracking-tight text-white">
              Let&apos;s Set Up Your Vault
            </Text>
            <Text className="max-w-[280px] text-center text-xs font-normal leading-4 text-slate-400">
              Configure your primary currency and opening ledger balance to get started.
            </Text>
          </View>

          {/* Form Card */}
          <View className="rounded-3xl border border-white/10 bg-[#11141F] p-5 shadow-2xl">
            {/* Currency Selector */}
            <CurrencySelectorCard currency={selectedCurrency} onPress={() => setPickerOpen(true)} />

            {/* Starting Balance */}
            <StartingBalanceInput
              control={control}
              symbol={selectedCurrency.symbol}
              errorMessage={formErrors.startingBalance?.message}
              onClearError={() => {
                setError('')
                setIsDbOffline(false)
              }}
            />

            {/* Error Message with Database Guidance */}
            {error ? (
              <View className="mt-3 flex-col gap-2 rounded-xl border border-[#FF4D6D]/30 bg-red-500/10 p-3">
                <View className="flex-row items-start gap-2">
                  <AlertTriangle size={16} color="#FF4D6D" className="mt-0.5" />
                  <Text className="flex-1 text-xs font-medium leading-4 text-[#FF4D6D]">
                    {error}
                  </Text>
                </View>

                {isDbOffline && (
                  <TouchableOpacity
                    onPress={() => proceedLocally()}
                    activeOpacity={0.8}
                    className="mt-1 flex-row items-center justify-center gap-1.5 rounded-lg border border-[#FF4D6D]/30 bg-[#FF4D6D]/20 px-3 py-2"
                  >
                    <Text className="text-xs font-bold text-white">
                      Continue to Dashboard (Demo Mode)
                    </Text>
                    <ArrowRight size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
              </View>
            ) : null}

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit(handleSave)}
              disabled={saving}
              activeOpacity={0.85}
              className="mt-6 overflow-hidden rounded-2xl shadow-lg shadow-[#00E599]/20"
            >
              <LinearGradient
                colors={['#00E599', '#00B4D8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="items-center justify-center py-4"
              >
                {saving ? (
                  <ActivityIndicator color="#08090D" />
                ) : (
                  <View className="flex-row items-center justify-center gap-2">
                    <CheckCircle2 size={18} color="#08090D" strokeWidth={2.5} />
                    <Text className="text-sm font-black uppercase tracking-wider text-[#08090D]">
                      Launch Wallex
                    </Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      <CurrencyPicker
        visible={pickerOpen}
        selectedCode={selectedCurrency.code}
        onSelect={curr => setSelectedCurrency(curr)}
        onClose={() => setPickerOpen(false)}
      />
    </SafeAreaView>
  )
}
