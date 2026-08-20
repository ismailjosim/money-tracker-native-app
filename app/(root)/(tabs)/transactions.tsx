import { useAccountsQuery } from '@/hooks/queries/useAccountsQuery'
import { useTransactionsQuery } from '@/hooks/queries/useTransactionsQuery'
import { Transaction, TransactionType } from '@/types'
import { eachDayOfInterval, format, startOfDay, startOfMonth } from 'date-fns'
import { useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
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
import { useDeleteTransaction } from '@/hooks/mutations/useTransactionMutations'
import { exportTransactionsToCsv } from '@/components/Shared/exportTransactions'
import { Feather } from '@expo/vector-icons'
import { BarChart } from 'react-native-gifted-charts'
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

const Transactions = () => {
  const router = useRouter()

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
        { value: income, label, frontColor: '#3DDC84' },
        { value: expense, frontColor: '#FF6B4A' },
      ]
    })
  }, [transactions])

  const handleExport = async () => {
    if (exporting) return
    setExporting(true)
    try {
      const { count } = await exportTransactionsToCsv(transactions)
      if (count === 0) {
        Alert.alert('Nothing to export', 'No transactions in the export window.')
      }
    } catch (err) {
      console.error('Export failed:', err)
      Alert.alert('Error', "Couldn't export transactions.")
    } finally {
      setExporting(false)
    }
  }

  const handleDelete = (tx: Transaction) => {
    Alert.alert('Delete transaction', 'Are you sure you want to delete this transaction?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const { error: deleteError } = await removeTransaction(tx)
          if (deleteError) {
            Alert.alert('Error', "Couldn't delete this transaction.")
          }
        },
      },
    ])
  }
  return (
    <SafeAreaView className="flex-1 bg-brand-body" edges={['top']}>
      <View className="px-5 pb-2 pt-3">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-xl font-semibold text-brand-bg">Transactions</Text>
          <TouchableOpacity
            onPress={handleExport}
            disabled={exporting}
            className="h-9 w-9 items-center justify-center rounded-full border border-[#E8E6DF] bg-white"
          >
            {exporting ? (
              <ActivityIndicator size="small" color="#5C5F68" />
            ) : (
              <Feather name="download" size={15} color="#5C5F68" />
            )}
          </TouchableOpacity>
        </View>

        {/* section: for searching */}
        <View className="mb-2.5 flex-row items-center gap-2 rounded-xl border border-[#E8E6DF] bg-white px-3.5 py-2.5">
          <Feather name="search" size={15} color="#8A8D96" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search transactions"
            placeholderTextColor="#8A8D96"
            className="flex-1 text-xs text-brand-bg"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Feather name="x" size={15} color="#8A8D96" />
            </TouchableOpacity>
          )}
        </View>

        {/* filter bar: for filtering transactions */}
        <View className="mb-2.5 flex-row gap-2">
          {FILTERS.map(filter => (
            <TouchableOpacity
              key={filter}
              onPress={() => setActiveFilter(filter)}
              className={`rounded-full border px-3.5 py-1.5 ${
                activeFilter === filter
                  ? 'border-brand-bg bg-brand-bg'
                  : 'border-[#E8E6DF] bg-white'
              }`}
            >
              <Text
                className={`text-xs ${
                  activeFilter === filter ? 'text-white' : 'text-brand-text-secondary'
                }`}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* section: for account filtering */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => setActiveAccountId(null)}
              className={`rounded-full border px-3.5 py-1.5 ${
                activeAccountId === null
                  ? 'border-brand-bg bg-brand-bg'
                  : 'border-[#E8E6DF] bg-white'
              }`}
            >
              <Text
                className={`text-xs ${
                  activeAccountId === null ? 'text-white' : 'text-brand-text-secondary'
                }`}
              >
                All Accounts
              </Text>
            </TouchableOpacity>
            {accounts.map(account => (
              <TouchableOpacity
                key={account.id}
                onPress={() => setActiveAccountId(account.id)}
                className={`rounded-full border px-3.5 py-1.5 ${
                  activeAccountId === account.id
                    ? 'border-brand-bg bg-brand-bg'
                    : 'border-[#E8E6DF] bg-white'
                }`}
              >
                <Text
                  className={`text-xs ${
                    activeAccountId === account.id ? 'text-white' : 'text-brand-text-secondary'
                  }`}
                >
                  {account.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* section: for showing transactions */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#4A9EFF" />
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center">
            <Feather name="alert-circle" size={32} color="#FF6B4A" />
            <Text className="mt-3 text-center text-sm text-brand-text-muted">
              Couldn&apos;t load transactions.
            </Text>
            <TouchableOpacity
              onPress={() => loadData()}
              className="mt-4 rounded-full bg-brand-bg px-4 py-2"
            >
              <Text className="text-xs font-medium text-white">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredTransactions}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TransactionRow tx={item} onDelete={() => handleDelete(item)} />
            )}
            contentContainerStyle={{
              paddingHorizontal: 5,
              paddingTop: 8,
              paddingBottom: 100,
            }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}
            ListHeaderComponent={
              transactions.length > 0 ? (
                <View className="mb-4 rounded-2xl border border-[#E8E6DF] bg-white p-4">
                  <View className="mb-3 flex-row items-center justify-between">
                    <Text className="text-xs font-medium text-brand-bg">
                      Daily income vs expense
                    </Text>
                    <View className="flex-row gap-3">
                      <View className="flex-row items-center gap-1">
                        <View className="h-2 w-2 rounded-full bg-brand-success" />
                        <Text className="text-[10px] text-brand-text-secondary">Income</Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <View className="h-2 w-2 rounded-full bg-brand-coral" />
                        <Text className="text-[10px] text-brand-text-secondary">Expense</Text>
                      </View>
                    </View>
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <BarChart
                      data={dailyIncomeExpense}
                      width={Math.max(dailyIncomeExpense.length * 9, 280)}
                      height={120}
                      barWidth={6}
                      spacing={4}
                      hideYAxisText
                      xAxisColor="#E8E6DF"
                      yAxisColor="transparent"
                      rulesColor="#F0EEE7"
                      noOfSections={3}
                      xAxisLabelTextStyle={{ color: '#8A8D96', fontSize: 7 }}
                      isThreeD={false}
                      roundedTop
                    />
                  </ScrollView>
                </View>
              ) : null
            }
            ListEmptyComponent={
              <View className="items-center justify-center py-20">
                <Feather name="inbox" size={32} color="#BDC3C7" />
                <Text className="mt-3 text-sm text-brand-text-muted">
                  {search ? 'No matching transactions' : 'No transactions yet'}
                </Text>
              </View>
            }
          />
        )}
      </View>
      {/* Add transaction FAB - navigates to the Add tab */}
      <TouchableOpacity
        onPress={() => router.push('/(root)/(tabs)/add-transaction')}
        className="absolute right-5 h-14 w-14 items-center justify-center rounded-full bg-brand-bg shadow-lg"
        style={{ bottom: 90 }}
        activeOpacity={0.85}
      >
        <Feather name="plus" size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  )
}

export default Transactions
