import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useUser } from '@clerk/expo'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format, isValid } from 'date-fns'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { Calendar as CalendarIcon, AlertCircle, FileText, CheckCircle2 } from 'lucide-react-native'

import { AIActionCard } from '@/components/AddTransaction/AIActionCard'
import { CalendarPicker } from '@/components/AddTransaction/CalendarPicker'
import { PillGroup } from '@/components/AddTransaction/PillGroup'
import { ReceiptScannerModal } from '@/components/AddTransaction/ReceiptScannerModal'
import { VoiceRecorderModal } from '@/components/AddTransaction/VoiceRecorderModal'
import { CategoryKey, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/constants/categories'
import { AI_GRADIENT, AI_GRADIENT_REVERSE } from '@/constants/theme'
import { useCreateTransaction } from '@/hooks/mutations/useTransactionMutations'
import { useAccountsQuery } from '@/hooks/queries/useAccountsQuery'
import { useUserStore } from '@/store/useStore'
import { TransactionFormValues, transactionSchema } from '@/lib/schemas/transaction'
import { extractTransactionFromReceipt } from '@/lib/services/extractTransaction'
import { Account, ExtractedTransaction, InputMethod } from '@/types'

const TYPE_OPTIONS = [
  { key: 'EXPENSE' as const, label: 'Expense' },
  { key: 'INCOME' as const, label: 'Income' },
]

const DEFAULT_VALUES = (accounts: Account[]): TransactionFormValues => ({
  type: 'EXPENSE',
  amount: '',
  category: 'food',
  accountId: accounts[0]?.id ?? '',
  description: '',
  date: new Date(),
})

export default function AddTransactionScreen() {
  const { user } = useUser()
  const router = useRouter()
  const params = useLocalSearchParams<{ action?: string }>()
  const currency = useUserStore(s => s.currency)

  const {
    data: accounts = [],
    isLoading: loadingAccounts,
    isError: accountsError,
  } = useAccountsQuery()
  const { mutateAsync: createTransaction, isPending: saving } = useCreateTransaction()

  const [error, setError] = useState('')
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [inputMethod, setInputMethod] = useState<InputMethod>('MANUAL')
  const [voiceTranscript, setVoiceTranscript] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [voiceModalOpen, setVoiceModalOpen] = useState(false)

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset: resetForm,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    mode: 'onBlur',
    defaultValues: DEFAULT_VALUES([]),
  })

  const type = watch('type')
  const category = watch('category')
  const accountId = watch('accountId')
  const date = watch('date')

  const categories = type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  useEffect(() => {
    if (accounts.length > 0) resetForm(DEFAULT_VALUES(accounts))
  }, [accounts, resetForm])

  useEffect(() => {
    if (params.action === 'scan') setScannerOpen(true)
    if (params.action === 'voice') setVoiceModalOpen(true)
  }, [params.action])

  const applyExtraction = (result: ExtractedTransaction) => {
    const categoryList = result.type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
    const isValidCategory = (key: CategoryKey | null): key is CategoryKey =>
      !!key && categoryList.some(c => c.key === key)

    if (result.type) setValue('type', result.type)
    if (isValidCategory(result.category)) setValue('category', result.category)
    if (result.amount != null) setValue('amount', String(result.amount))
    if (result.description) setValue('description', result.description)
    if (result.date) {
      const parsedDate = new Date(result.date)
      if (isValid(parsedDate) && parsedDate <= new Date()) {
        setValue('date', parsedDate)
      }
    }

    const missing = [
      result.amount == null && 'amount',
      !isValidCategory(result.category) && 'category',
    ].filter(Boolean)
    if (missing.length > 0) {
      Alert.alert(
        'Review before saving',
        `Couldn't confidently read the ${missing.join(' and ')}. Please fill it in.`
      )
    }
  }

  const onSubmit = async (values: TransactionFormValues) => {
    if (!user) return

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {})
    setError('')

    const parsed = parseFloat(values.amount.replace(/,/g, ''))

    const { error: createError } = await createTransaction({
      user_id: user.id,
      account_id: values.accountId,
      type: values.type,
      amount: parsed,
      category: values.category,
      description: values.description?.trim() || null,
      date: values.date.toISOString(),
      input_method: inputMethod,
      voice_transcript: inputMethod === 'VOICE' ? voiceTranscript : null,
    })

    if (createError) {
      setError('Something went wrong. Please try again.')
      return
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})
    resetForm(DEFAULT_VALUES(accounts))
    setInputMethod('MANUAL')
    setVoiceTranscript(null)
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace('/(root)/(tabs)/transactions')
    }
  }

  const handleReceiptCaptured = async (base64: string, mimeType: string) => {
    setScannerOpen(false)
    setScanning(true)
    try {
      const extracted = await extractTransactionFromReceipt(base64, mimeType)
      applyExtraction(extracted)
      setInputMethod('RECEIPT_SCAN')
    } catch (err) {
      console.error('Receipt scan failed:', err)
      Alert.alert('Error', "Couldn't read that receipt. Try again or enter it manually.")
    } finally {
      setScanning(false)
    }
  }

  const handleVoiceExtracted = (result: ExtractedTransaction) => {
    applyExtraction(result)
    setVoiceTranscript(result.transcript)
    setInputMethod('VOICE')
  }

  return (
    <SafeAreaView className="flex-1 bg-[#08090D]" edges={['top']}>
      {/* Top Header */}
      <View className="px-5 pb-3 pt-2.5">
        <Text className="text-xl font-black tracking-tight text-white">New Transaction</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        {loadingAccounts ? (
          <View className="flex-1 items-center justify-center px-6">
            <ActivityIndicator color="#00E599" size="large" />
          </View>
        ) : accountsError ? (
          <View className="flex-1 items-center justify-center px-6">
            <AlertCircle size={36} color="#FF4D6D" />
            <Text className="mt-2.5 text-center text-sm font-semibold text-[#FF4D6D]">
              Couldn&apos;t load your accounts.
            </Text>
          </View>
        ) : accounts.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6">
            <AlertCircle size={36} color="#FF4D6D" />
            <Text className="mt-2.5 text-center text-sm font-semibold text-[#FF4D6D]">
              You need an account before creating a transaction.
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 110 }}
          >
            {/* AI Capture shortcuts */}
            <View className="mb-4 flex-row gap-2.5">
              <AIActionCard
                icon="camera"
                title="Scan receipt"
                subtitle="Snap a photo"
                colors={AI_GRADIENT}
                onPress={() => setScannerOpen(true)}
              />
              <AIActionCard
                icon="mic"
                title="Voice log"
                subtitle="Just say it"
                colors={AI_GRADIENT_REVERSE}
                onPress={() => setVoiceModalOpen(true)}
              />
            </View>

            {/* Type Toggle (Segmented Pill) */}
            <View className="mb-4 flex-row rounded-2xl border border-white/10 bg-[#111420] p-1">
              {TYPE_OPTIONS.map(t => {
                const isSelected = type === t.key
                return (
                  <TouchableOpacity
                    key={t.key}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
                      setValue('type', t.key)
                      setValue(
                        'category',
                        t.key === 'INCOME' ? INCOME_CATEGORIES[0].key : EXPENSE_CATEGORIES[0].key
                      )
                    }}
                    activeOpacity={0.8}
                    className={`flex-1 items-center justify-center rounded-xl py-2.5 ${
                      isSelected ? (t.key === 'INCOME' ? 'bg-[#00E599]' : 'bg-[#FF4D6D]') : ''
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        isSelected ? 'font-bold text-[#08090D]' : 'text-slate-400'
                      }`}
                    >
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>

            {/* Big Hero Amount Input */}
            <View className="mb-4 items-center rounded-3xl border border-white/10 bg-[#111420] p-5 shadow-xl">
              <Text className="mb-2 text-[11px] font-bold tracking-wider text-slate-400">
                AMOUNT ({currency})
              </Text>
              <Controller
                control={control}
                name="amount"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    value={value}
                    onChangeText={v => {
                      setError('')
                      onChange(v)
                    }}
                    onBlur={onBlur}
                    placeholder="0.00"
                    placeholderTextColor="#475569"
                    keyboardType="numeric"
                    className={`p-0 text-4xl font-black tracking-tight ${
                      type === 'INCOME' ? 'text-[#00E599]' : 'text-[#FF4D6D]'
                    }`}
                  />
                )}
              />
              {errors.amount && (
                <Text className="mt-1.5 text-xs text-[#FF4D6D]">{errors.amount.message}</Text>
              )}
            </View>

            {/* Category Selector */}
            <View className="mb-4">
              <Text className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Category
              </Text>
              <PillGroup
                options={categories.map(c => ({
                  key: c.key,
                  label: c.label,
                  icon: c.icon,
                }))}
                value={category}
                onChange={key => setValue('category', key)}
              />
            </View>

            {/* Account Selector */}
            <View className="mb-4">
              <Text className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Account
              </Text>
              <PillGroup
                options={accounts.map(a => ({ key: a.id, label: a.name }))}
                value={accountId}
                onChange={key => setValue('accountId', key)}
              />
              {errors.accountId && (
                <Text className="mt-1.5 text-xs text-[#FF4D6D]">{errors.accountId.message}</Text>
              )}
            </View>

            {/* Date Selector */}
            <View className="mb-4">
              <Text className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Date
              </Text>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
                  setDatePickerOpen(v => !v)
                }}
                activeOpacity={0.8}
                className="flex-row items-center justify-between rounded-2xl border border-white/10 bg-[#111420] px-4 py-3.5"
              >
                <View className="flex-row items-center gap-2.5">
                  <CalendarIcon size={16} color="#00E599" />
                  <Text className="text-sm font-semibold text-white">
                    {format(date, 'd MMMM yyyy')}
                  </Text>
                </View>
                <Text className="text-xs font-bold text-[#00E599]">
                  {datePickerOpen ? 'Hide' : 'Change'}
                </Text>
              </TouchableOpacity>

              {datePickerOpen && (
                <View className="mt-2.5 overflow-hidden rounded-2xl border border-white/10 bg-[#111420] p-2">
                  <CalendarPicker
                    value={date}
                    maximumDate={new Date()}
                    onChange={d => {
                      setValue('date', d)
                      setDatePickerOpen(false)
                    }}
                  />
                </View>
              )}
            </View>

            {/* Note / Description */}
            <View className="mb-4">
              <Text className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Note (Optional)
              </Text>
              <View className="flex-row items-center gap-2.5 rounded-2xl border border-white/10 bg-[#111420] px-4 py-3">
                <FileText size={16} color="#64748B" />
                <Controller
                  control={control}
                  name="description"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextInput
                      value={value ?? ''}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="What was this for?"
                      placeholderTextColor="#475569"
                      className="flex-1 p-0 text-sm text-white"
                    />
                  )}
                />
              </View>
            </View>

            {error ? (
              <Text className="mb-3 text-center text-xs text-[#FF4D6D]">{error}</Text>
            ) : null}

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={saving}
              activeOpacity={0.85}
              className="mt-2 overflow-hidden rounded-2xl shadow-lg shadow-[#00E599]/20"
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
                      Save Transaction
                    </Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        )}
      </KeyboardAvoidingView>

      {/* AI Modals */}
      <ReceiptScannerModal
        visible={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onCaptured={handleReceiptCaptured}
      />

      <VoiceRecorderModal
        visible={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        onExtracted={handleVoiceExtracted}
      />

      {scanning && (
        <View className="absolute inset-0 z-50 items-center justify-center bg-black/75">
          <View className="items-center gap-3 rounded-2xl border border-white/10 bg-[#111420] p-6">
            <ActivityIndicator size="large" color="#00E599" />
            <Text className="text-sm font-semibold text-white">Reading receipt with AI...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  )
}
