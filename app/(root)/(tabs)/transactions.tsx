import React, { useMemo, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  FlatList,
  RefreshControl,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { eachDayOfInterval, format, startOfDay, startOfMonth } from 'date-fns'
import { BarChart } from 'react-native-gifted-charts'
import * as Haptics from 'expo-haptics'
import { Search, X, Download, AlertCircle, Inbox, Wallet } from 'lucide-react-native'

import { useAccountsQuery } from '@/hooks/queries/useAccountsQuery'
import { useTransactionsQuery } from '@/hooks/queries/useTransactionsQuery'
import { Transaction, TransactionType } from '@/types'
import { useDeleteTransaction } from '@/hooks/mutations/useTransactionMutations'
import { exportTransactionsToCsv } from '@/components/Shared/exportTransactions'
import { TransactionRow } from '@/components/Shared/TransactionRow'

const FILTERS = ['All', 'Income', 'Expenses'] as const

const dayKey = (date: Date) => {
  return format(date, 'yyyy-MM-dd')
}

function currentMonthDays() {
  const today = startOfDay(new Date())
  return eachDayOfInterval({ start: startOfMonth(today), end: today }).map(d => ({
    key: dayKey(d),
    label: format(d, 'd MMM'),
  }))
}

export default function TransactionsScreen() {
  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]>('All')
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [exporting, setExporting] = useState(false)

  const typeFilter: TransactionType | null =
    activeFilter === 'Income' ? 'INCOME' : activeFilter === 'Expenses' ? 'EXPENSE' : null

  const {
    data: transactions = [],
    isLoading: transactionsLoading,
    isRefetching: transactionsRefetching,
    isError: transactionsError,
    refetch: refetchTransactions,
  } = useTransactionsQuery({ type: typeFilter, accountId: activeAccountId })

  const { data: accounts = [], refetch: refetchAccounts } = useAccountsQuery()
  const { mutateAsync: removeTransaction } = useDeleteTransaction()

  const loading = transactionsLoading
  const refreshing = transactionsRefetching
  const error = transactionsError

  const loadData = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
    refetchTransactions()
    refetchAccounts()
  }

  const filteredTransactions = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return transactions
    return transactions.filter(
      tx => tx.description?.toLowerCase().includes(q) || tx.category.toLowerCase().includes(q)
    )
  }, [transactions, search])

  const dailyIncomeExpense = useMemo(() => {
    const days = currentMonthDays()
    return days.flatMap(({ key, label }) => {
      const income = transactions
        .filter(tx => tx.type === 'INCOME' && dayKey(new Date(tx.date)) === key)
        .reduce((sum, tx) => sum + tx.amount, 0)
      const expense = transactions
        .filter(tx => tx.type === 'EXPENSE' && dayKey(new Date(tx.date)) === key)
        .reduce((sum, tx) => sum + tx.amount, 0)
      return [
        { value: income, label, frontColor: '#00E599' },
        { value: expense, frontColor: '#FF4D6D' },
      ]
    })
  }, [transactions])

  const handleExport = async () => {
    if (exporting) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {})
    setExporting(true)
    try {
      const { count } = await exportTransactionsToCsv(transactions)
      if (count === 0) {
        Alert.alert('Nothing to export', 'No transactions in the export window.')
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})
      }
    } catch (err) {
      console.error('Export failed:', err)
      Alert.alert('Error', "Couldn't export transactions.")
    } finally {
      setExporting(false)
    }
  }

  const handleDelete = (tx: Transaction) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {})
    Alert.alert('Delete transaction', 'Are you sure you want to delete this transaction?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const { error: deleteError } = await removeTransaction(tx)
          if (deleteError) {
            Alert.alert('Error', "Couldn't delete this transaction.")
          } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})
          }
        },
      },
    ])
  }

  return (
    <SafeAreaView className="flex-1 bg-[#08090D]" edges={['top']}>
      {/* Top Header */}
      <View className="flex-row items-center justify-between px-4 pb-3 pt-2">
        <View className="flex-row items-center gap-2">
          <Text className="text-xl font-black tracking-tight text-white">Activity</Text>
          <View className="rounded-full border border-[#00E599]/30 bg-[#00E599]/15 px-2 py-0.5">
            <Text className="text-[11px] font-bold text-[#00E599]">
              {filteredTransactions.length}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleExport}
          disabled={exporting}
          activeOpacity={0.75}
          className="h-9 w-9 items-center justify-center rounded-full border border-[#00E599]/30 bg-[#111420] shadow-md shadow-[#00E599]/10"
        >
          {exporting ? (
            <ActivityIndicator size="small" color="#00E599" />
          ) : (
            <Download size={16} color="#00E599" />
          )}
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View className="mb-2.5 px-4">
        <View className="flex-row items-center gap-2 rounded-2xl border border-white/10 bg-[#111420] px-3 py-2.5">
          <Search size={15} color="#94A3B8" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search activity by name or category..."
            placeholderTextColor="#64748B"
            className="flex-1 p-0 text-xs text-white"
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={15} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Type Filter Chips */}
      <View className="mb-2.5 flex-row gap-2 px-4">
        {FILTERS.map(filter => {
          const isActive = activeFilter === filter
          return (
            <TouchableOpacity
              key={filter}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
                setActiveFilter(filter)
              }}
              activeOpacity={0.7}
              className={`rounded-full border px-3.5 py-1.5 ${
                isActive ? 'border-[#00E599] bg-[#00E599]' : 'border-white/10 bg-[#111420]'
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  isActive ? 'font-bold text-[#08090D]' : 'text-slate-400'
                }`}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>

      {/* Account Horizontal Filter */}
      <View className="mb-3">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
              setActiveAccountId(null)
            }}
            activeOpacity={0.7}
            className={`flex-row items-center gap-1.5 rounded-2xl border px-3 py-1.5 ${
              activeAccountId === null
                ? 'border-[#00E599] bg-[#00E599]'
                : 'border-white/10 bg-[#111420]'
            }`}
          >
            <Wallet size={12} color={activeAccountId === null ? '#08090D' : '#94A3B8'} />
            <Text
              className={`text-xs ${
                activeAccountId === null ? 'font-bold text-[#08090D]' : 'font-medium text-slate-400'
              }`}
            >
              All Accounts
            </Text>
          </TouchableOpacity>

          {accounts.map(account => {
            const isSelected = activeAccountId === account.id
            return (
              <TouchableOpacity
                key={account.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
                  setActiveAccountId(account.id)
                }}
                activeOpacity={0.7}
                className={`rounded-2xl border px-3 py-1.5 ${
                  isSelected ? 'border-[#00E599] bg-[#00E599]' : 'border-white/10 bg-[#111420]'
                }`}
              >
                <Text
                  className={`text-xs ${
                    isSelected ? 'font-bold text-[#08090D]' : 'font-medium text-slate-400'
                  }`}
                >
                  {account.name}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>

      {/* Main Content & List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#00E599" size="large" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center p-6">
          <AlertCircle size={36} color="#FF4D6D" />
          <Text className="mb-4 mt-3 text-sm font-semibold text-white">
            Couldn&apos;t load activity.
          </Text>
          <TouchableOpacity
            onPress={loadData}
            className="rounded-xl bg-[#00E599] px-5 py-2.5 shadow-md"
          >
            <Text className="text-xs font-bold text-[#08090D]">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TransactionRow tx={item} onDelete={() => handleDelete(item)} />
          )}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 110 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={loadData}
              tintColor="#00E599"
              colors={['#00E599']}
            />
          }
          ListHeaderComponent={
            transactions.length > 0 ? (
              <View className="mb-3.5 rounded-2xl border border-white/10 bg-[#111420] p-4 shadow-xl">
                <View className="mb-3 flex-row items-center justify-between">
                  <Text className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Daily Cashflow
                  </Text>
                  <View className="flex-row items-center gap-3">
                    <View className="flex-row items-center gap-1">
                      <View className="h-2 w-2 rounded-full bg-[#00E599]" />
                      <Text className="text-[10px] font-medium text-slate-400">In</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <View className="h-2 w-2 rounded-full bg-[#FF4D6D]" />
                      <Text className="text-[10px] font-medium text-slate-400">Out</Text>
                    </View>
                  </View>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <BarChart
                    data={dailyIncomeExpense}
                    width={Math.max(dailyIncomeExpense.length * 9, 290)}
                    height={115}
                    barWidth={5}
                    spacing={4}
                    hideYAxisText
                    xAxisColor="rgba(255, 255, 255, 0.1)"
                    yAxisColor="transparent"
                    rulesColor="rgba(255, 255, 255, 0.04)"
                    noOfSections={3}
                    xAxisLabelTextStyle={{ color: '#64748B', fontSize: 8 }}
                    isThreeD={false}
                    roundedTop
                  />
                </ScrollView>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-16">
              <Inbox size={36} color="#64748B" />
              <Text className="mb-1 mt-3 text-sm font-semibold text-white">
                {search ? 'No matching activity' : 'No activity logged yet'}
              </Text>
              <Text className="max-w-[240px] text-center text-xs text-slate-400">
                Transactions logged manually or via AI will display here
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  )
}
