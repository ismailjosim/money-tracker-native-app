import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useUser } from '@clerk/expo'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { isValid } from 'date-fns'
import * as Haptics from 'expo-haptics'

import { AIActionCard } from '@/components/AddTransaction/AIActionCard'
import { AccountStatusView } from '@/components/AddTransaction/AccountStatusView'
import { AmountCard } from '@/components/AddTransaction/AmountCard'
import { DateSelector } from '@/components/AddTransaction/DateSelector'
import { NoteInput } from '@/components/AddTransaction/NoteInput'
import { PillGroup } from '@/components/AddTransaction/PillGroup'
import { ReceiptScannerModal } from '@/components/AddTransaction/ReceiptScannerModal'
import { SubmitTransactionButton } from '@/components/AddTransaction/SubmitTransactionButton'
import { TypeSelector } from '@/components/AddTransaction/TypeSelector'
import { VoiceRecorderModal } from '@/components/AddTransaction/VoiceRecorderModal'
import { CategoryKey, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/constants/categories'
import { AI_GRADIENT, AI_GRADIENT_REVERSE } from '@/constants/theme'
import { useCreateTransaction } from '@/hooks/mutations/useTransactionMutations'
import { useAccountsQuery } from '@/hooks/queries/useAccountsQuery'
import { useUserStore } from '@/store/useStore'
import { toast } from '@/store/useToastStore'
import { TransactionFormValues, transactionSchema } from '@/lib/schemas/transaction'
import { extractTransactionFromReceipt } from '@/lib/services/extractTransaction'
import { Account, ExtractedTransaction, InputMethod } from '@/types'

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
      toast.error('Could not save transaction')
      return
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})
    toast.success('Transaction saved successfully!')
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
      toast.success('Receipt parsed with AI!')
    } catch (err) {
      console.error('Receipt scan failed:', err)
      toast.error("Couldn't read receipt. Try again or enter manually.")
    } finally {
      setScanning(false)
    }
  }

  const handleVoiceExtracted = (result: ExtractedTransaction) => {
    applyExtraction(result)
    setVoiceTranscript(result.transcript)
    setInputMethod('VOICE')
    toast.success('Voice log parsed with AI!')
  }

  const handleAddPreset = (delta: number) => {
    const current = parseFloat(watch('amount') || '0') || 0
    setValue('amount', String(current + delta))
    setError('')
  }

  const hasAccountIssues = loadingAccounts || accountsError || accounts.length === 0

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-[#08090D]" edges={['top']}>
      {/* Top Header */}
      <View className="px-5 pb-3 pt-2.5">
        <Text className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
          New Transaction
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        {hasAccountIssues ? (
          <AccountStatusView
            loading={loadingAccounts}
            error={accountsError}
            empty={accounts.length === 0}
          />
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

            {/* Type Toggle */}
            <TypeSelector
              value={type}
              onChange={newType => {
                setValue('type', newType)
                setValue(
                  'category',
                  newType === 'INCOME' ? INCOME_CATEGORIES[0].key : EXPENSE_CATEGORIES[0].key
                )
              }}
            />

            {/* Hero Amount Input Card */}
            <AmountCard
              control={control}
              type={type}
              currency={currency}
              errorMessage={errors.amount?.message}
              onClearError={() => setError('')}
              onAddAmount={handleAddPreset}
            />

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
            <DateSelector
              date={date}
              isOpen={datePickerOpen}
              onToggle={() => setDatePickerOpen(v => !v)}
              onSelectDate={d => {
                setValue('date', d)
                setDatePickerOpen(false)
              }}
            />

            {/* Note / Description */}
            <NoteInput control={control} />

            {error ? (
              <Text className="mb-3 text-center text-xs text-[#FF4D6D]">{error}</Text>
            ) : null}

            {/* Submit Button */}
            <SubmitTransactionButton saving={saving} onPress={handleSubmit(onSubmit)} />
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
