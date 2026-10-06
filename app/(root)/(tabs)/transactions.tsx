import React, { useMemo, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'
import { Download, AlertCircle, Inbox } from 'lucide-react-native'

import { useAccountsQuery } from '@/hooks/queries/useAccountsQuery'
import { useTransactionsQuery } from '@/hooks/queries/useTransactionsQuery'
import { Transaction, TransactionType } from '@/types'
import { useDeleteTransaction } from '@/hooks/mutations/useTransactionMutations'
import { exportTransactionsToCsv } from '@/components/Shared/exportTransactions'
import { TransactionRow } from '@/components/Shared/TransactionRow'
import { ConfirmDialog } from '@/components/Shared/ConfirmDialog'
import { toast } from '@/store/useToastStore'
import { DailyTransactionsChart } from '@/components/Transactions/DailyTransactionsChart'
import { TransactionsFilterBar, FilterType } from '@/components/Transactions/TransactionsFilterBar'

export default function TransactionsScreen() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('All')
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
        toast.success('Transactions exported successfully')
      }
    } catch (err) {
      console.error('Export failed:', err)
      toast.error("Couldn't export transactions")
    } finally {
      setExporting(false)
    }
  }

  const [deleteDialogTx, setDeleteDialogTx] = useState<Transaction | null>(null)
  const [deletingTx, setDeletingTx] = useState(false)

  const handleDelete = (tx: Transaction) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {})
    setDeleteDialogTx(tx)
  }

  const handleConfirmDeleteTx = async () => {
    if (!deleteDialogTx) return
    setDeletingTx(true)
    try {
      const { error: deleteError } = await removeTransaction(deleteDialogTx)
      if (deleteError) {
        toast.error("Couldn't delete transaction")
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})
        toast.success('Transaction deleted')
        setDeleteDialogTx(null)
      }
    } catch {
      toast.error("Couldn't delete transaction")
    } finally {
      setDeletingTx(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-[#08090D]" edges={['top']}>
      {/* Top Header */}
      <View className="flex-row items-center justify-between px-5 pb-3 pt-2">
        <View>
          <Text className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
            Transactions
          </Text>
          <Text className="text-xs text-slate-500 dark:text-slate-400">
            {filteredTransactions.length} transaction
            {filteredTransactions.length === 1 ? '' : 's'} recorded
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleExport}
          disabled={exporting || transactions.length === 0}
          activeOpacity={0.75}
          className="flex-row items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 shadow-md dark:border-white/10 dark:bg-[#111420]"
        >
          {exporting ? (
            <ActivityIndicator size="small" color="#00E599" />
          ) : (
            <>
              <Download size={14} color="#00E599" strokeWidth={2.5} />
              <Text className="text-xs font-bold text-[#00E599]">Export CSV</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#00E599" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-6">
          <AlertCircle size={40} color="#FF4D6D" />
          <Text className="mt-3 text-center text-sm font-semibold text-slate-900 dark:text-white">
            Could not load transactions
          </Text>
          <TouchableOpacity onPress={loadData} className="mt-4 rounded-xl bg-white/10 px-5 py-2.5">
            <Text className="text-xs font-bold text-[#00E599]">Try Again</Text>
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
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={loadData}
              tintColor="#00E599"
              colors={['#00E599']}
            />
          }
          ListHeaderComponent={
            <View>
              {/* Search & Filters */}
              <TransactionsFilterBar
                search={search}
                onSearchChange={setSearch}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                accounts={accounts}
                activeAccountId={activeAccountId}
                onAccountChange={setActiveAccountId}
              />

              {/* Monthly Flow Chart */}
              <DailyTransactionsChart transactions={transactions} />
            </View>
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-16">
              <Inbox size={36} color="#64748B" />
              <Text className="mb-1 mt-3 text-sm font-semibold text-slate-900 dark:text-white">
                {search ? 'No matching activity' : 'No activity logged yet'}
              </Text>
              <Text className="max-w-[240px] text-center text-xs text-slate-500 dark:text-slate-400">
                Transactions logged manually or via AI will display here
              </Text>
            </View>
          }
        />
      )}

      <ConfirmDialog
        visible={!!deleteDialogTx}
        title="Delete Transaction?"
        message={`Are you sure you want to delete this ${
          deleteDialogTx?.type.toLowerCase() ?? ''
        } transaction of ${deleteDialogTx?.amount ?? ''}? This cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        destructive
        loading={deletingTx}
        onConfirm={handleConfirmDeleteTx}
        onCancel={() => setDeleteDialogTx(null)}
      />
    </SafeAreaView>
  )
}
