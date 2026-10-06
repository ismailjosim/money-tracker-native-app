import React, { useMemo, useState } from 'react'
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useUser } from '@clerk/expo'
import { isSameMonth } from 'date-fns'
import * as Haptics from 'expo-haptics'
import { ArrowRight, Inbox } from 'lucide-react-native'

import { getCategoryConfig } from '@/constants/categories'
import { useAccountsQuery } from '@/hooks/queries/useAccountsQuery'
import { useBudgetQuery } from '@/hooks/queries/useBudgetQuery'
import { useTransactionsQuery } from '@/hooks/queries/useTransactionsQuery'
import { useUserStore } from '@/store/useStore'
import { Transaction } from '@/types'
import { TransactionRow } from '@/components/Shared/TransactionRow'
import { BudgetModal } from '@/components/Shared/BudgetModal'

import { HomeHeader } from '@/components/Home/HomeHeader'
import { BalanceHeroCard } from '@/components/Home/BalanceHeroCard'
import { QuickActionsBar } from '@/components/Home/QuickActionsBar'
import { CopilotBanner } from '@/components/Home/CopilotBanner'
import { BudgetSummaryCard } from '@/components/Home/BudgetSummaryCard'
import { SpendingBreakdownCard } from '@/components/Home/SpendingBreakdownCard'

export default function HomeScreen() {
  const { user } = useUser()
  const router = useRouter()
  const currency = useUserStore(s => s.currency)

  const [budgetModalOpen, setBudgetModalOpen] = useState(false)
  const [showBalance, setShowBalance] = useState(true)

  const {
    data: accounts = [],
    isLoading: accountLoading,
    isRefetching: accountsRefetching,
    refetch: refetchAccounts,
  } = useAccountsQuery()

  const {
    data: transactions = [],
    isLoading: transactionsLoading,
    isRefetching: transactionsRefetching,
    refetch: refetchTransactions,
  } = useTransactionsQuery()

  const { data: budget = null, refetch: refetchBudgets } = useBudgetQuery()

  const loading = accountLoading || transactionsLoading
  const refreshing = accountsRefetching || transactionsRefetching

  const onRefresh = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
    refetchAccounts()
    refetchTransactions()
    refetchBudgets()
  }

  const totalBalance = useMemo(
    () => accounts.reduce((sum, account) => sum + account.balance, 0),
    [accounts]
  )

  const monthTransactions = useMemo(() => {
    const now = new Date()
    return transactions.filter(tx => isSameMonth(new Date(tx.date), now))
  }, [transactions])

  const monthIncome = useMemo(
    () =>
      monthTransactions.filter(tx => tx.type === 'INCOME').reduce((sum, tx) => sum + tx.amount, 0),
    [monthTransactions]
  )

  const monthExpense = useMemo(
    () =>
      monthTransactions.filter(tx => tx.type === 'EXPENSE').reduce((sum, tx) => sum + tx.amount, 0),
    [monthTransactions]
  )

  const recentTransactions = useMemo(() => transactions.slice(0, 5), [transactions])

  const expenseBreakdown = useMemo(() => {
    const map: Record<string, number> = {}
    monthTransactions
      .filter(tx => tx.type === 'EXPENSE')
      .forEach(tx => {
        map[tx.category] = (map[tx.category] ?? 0) + tx.amount
      })

    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([category, amount]) => ({
        category: category as Transaction['category'],
        amount,
        color: getCategoryConfig(category as Transaction['category']).color,
      }))
  }, [monthTransactions])

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-[#08090D]" edges={['top']}>
      <ScrollView
        className="flex-1 bg-slate-50 dark:bg-[#08090D]"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00E599"
            colors={['#00E599']}
          />
        }
      >
        {/* Top Header */}
        <HomeHeader user={user ?? null} />

        {/* Total Net Worth Hero Card */}
        <BalanceHeroCard
          totalBalance={totalBalance}
          monthIncome={monthIncome}
          monthExpense={monthExpense}
          currency={currency}
          showBalance={showBalance}
          onTogglePrivacy={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
            setShowBalance(prev => !prev)
          }}
        />

        {/* Quick Actions Shortcuts */}
        <QuickActionsBar />

        {/* AI Copilot Banner */}
        <CopilotBanner />

        {/* Monthly Budget Summary Card */}
        <BudgetSummaryCard
          budget={budget}
          monthExpense={monthExpense}
          currency={currency}
          onOpenModal={() => setBudgetModalOpen(true)}
        />

        {/* Category Expense Breakdown */}
        <SpendingBreakdownCard expenseBreakdown={expenseBreakdown} currency={currency} />

        {/* Recent Activity Section */}
        <View className="mb-6">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Recent Activity
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(root)/(tabs)/transactions')}
              className="flex-row items-center gap-1"
            >
              <Text className="text-xs font-bold text-[#00E599]">See All</Text>
              <ArrowRight size={13} color="#00E599" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View className="items-center justify-center py-8">
              <ActivityIndicator color="#00E599" size="small" />
            </View>
          ) : recentTransactions.length === 0 ? (
            <View className="items-center rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#111420]">
              <Inbox size={32} color="#64748B" />
              <Text className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                No recent transactions
              </Text>
              <Text className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Your latest transactions will show up here
              </Text>
            </View>
          ) : (
            recentTransactions.map(tx => <TransactionRow key={tx.id} tx={tx} />)
          )}
        </View>
      </ScrollView>

      {user && (
        <BudgetModal
          visible={budgetModalOpen}
          budget={budget}
          onClose={() => setBudgetModalOpen(false)}
          onSaved={() => setBudgetModalOpen(false)}
        />
      )}
    </SafeAreaView>
  )
}
