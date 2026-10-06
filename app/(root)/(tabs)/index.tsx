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
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { useUser } from '@clerk/expo'
import { isSameMonth } from 'date-fns'
import { LinearGradient } from 'expo-linear-gradient'
import { PieChart } from 'react-native-gifted-charts'
import * as Haptics from 'expo-haptics'
import {
  Camera,
  Mic,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Edit2,
  Inbox,
  TrendingUp,
} from 'lucide-react-native'

import { getCategoryConfig } from '@/constants/categories'
import { useAccountsQuery } from '@/hooks/queries/useAccountsQuery'
import { useBudgetQuery } from '@/hooks/queries/useBudgetQuery'
import { useTransactionsQuery } from '@/hooks/queries/useTransactionsQuery'
import { useUserStore } from '@/store/useStore'
import { Transaction } from '@/types'
import { formatPrice } from '@/lib/utils/utils'
import { TransactionRow } from '@/components/Shared/TransactionRow'
import { BudgetModal } from '@/components/Shared/BudgetModal'

const QUICK_ACTIONS = [
  {
    icon: Camera,
    label: 'AI Scan',
    sub: 'Receipts',
    action: 'scan',
    color: '#00E599',
    bgColor: 'rgba(0, 229, 153, 0.12)',
  },
  {
    icon: Mic,
    label: 'Voice AI',
    sub: 'Speak it',
    action: 'voice',
    color: '#38BDF8',
    bgColor: 'rgba(56, 189, 248, 0.12)',
  },
  {
    icon: Plus,
    label: 'Quick Add',
    sub: 'Manual',
    action: 'manual',
    color: '#A855F7',
    bgColor: 'rgba(168, 85, 247, 0.12)',
  },
] as const

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

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

  const toggleBalancePrivacy = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
    setShowBalance(prev => !prev)
  }

  return (
    <SafeAreaView className="flex-1 bg-[#08090D]" edges={['top']}>
      <ScrollView
        className="flex-1 bg-[#08090D]"
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
        {/* Top Navigation & Profile Header */}
        <View className="mb-5 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Image
              source={require('../../../assets/images/transparent-logo.png')}
              className="h-8 w-20"
              contentFit="contain"
            />
            <View className="flex-row items-center gap-1 rounded-full border border-[#00E599]/25 bg-[#00E599]/10 px-2 py-0.5">
              <View className="h-1.5 w-1.5 rounded-full bg-[#00E599]" />
              <Text className="text-[9px] font-bold tracking-wider text-[#00E599]">AI ACTIVE</Text>
            </View>
          </View>

          <View className="flex-row items-center gap-2.5">
            <View className="items-end">
              <Text className="text-[10px] font-medium text-slate-400">{getGreeting()}</Text>
              <Text className="text-xs font-bold text-white" numberOfLines={1}>
                {user?.firstName || user?.lastName
                  ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
                  : 'Financier'}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => router.push('/(root)/(tabs)/profile')}
              activeOpacity={0.8}
              className="h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[#00E599]/30 bg-[#161B29] shadow-md shadow-[#00E599]/10"
            >
              {user?.imageUrl && user.hasImage ? (
                <Image
                  source={{ uri: user.imageUrl }}
                  className="h-9 w-9 rounded-full"
                  contentFit="cover"
                />
              ) : (
                <View className="h-9 w-9 items-center justify-center rounded-full bg-[#161B29]">
                  <Text className="text-sm font-black text-[#00E599]">
                    {(user?.firstName?.[0] || 'W').toUpperCase()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Digital Titanium Wallet Card */}
        <View className="mb-4">
          <LinearGradient
            colors={['#161D2E', '#0E121D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-3xl border border-white/10 p-5 shadow-2xl"
          >
            <View className="mb-2 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  TOTAL NET WORTH
                </Text>
                <TouchableOpacity
                  onPress={toggleBalancePrivacy}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {showBalance ? (
                    <Eye size={14} color="#94A3B8" />
                  ) : (
                    <EyeOff size={14} color="#94A3B8" />
                  )}
                </TouchableOpacity>
              </View>

              <View className="flex-row items-center gap-1 rounded-full border border-[#00E599]/30 bg-[#00E599]/15 px-2 py-0.5">
                <TrendingUp size={11} color="#00E599" />
                <Text className="text-[9px] font-bold text-[#00E599]">PRO</Text>
              </View>
            </View>

            {/* Total Balance Amount */}
            <View className="my-2">
              <Text className="text-3xl font-black tracking-tight text-white">
                {showBalance ? formatPrice(totalBalance, currency) : '••••••••'}
              </Text>
            </View>

            {/* Financial Performance Badges */}
            <View className="mt-2 flex-row items-center justify-between rounded-2xl border border-white/[0.04] bg-black/30 p-3">
              <View className="flex-1 flex-row items-center gap-2.5">
                <View className="h-8 w-8 items-center justify-center rounded-full bg-[#00E599]/15">
                  <ArrowUpRight size={14} color="#00E599" strokeWidth={2.5} />
                </View>
                <View>
                  <Text className="text-[10px] font-medium text-slate-400">Income</Text>
                  <Text className="text-xs font-bold text-[#00E599]">
                    {showBalance ? formatPrice(monthIncome, currency) : '••••'}
                  </Text>
                </View>
              </View>

              <View className="mx-2 h-7 w-[1px] bg-white/10" />

              <View className="flex-1 flex-row items-center gap-2.5">
                <View className="h-8 w-8 items-center justify-center rounded-full bg-[#FF4D6D]/15">
                  <ArrowDownRight size={14} color="#FF4D6D" strokeWidth={2.5} />
                </View>
                <View>
                  <Text className="text-[10px] font-medium text-slate-400">Expense</Text>
                  <Text className="text-xs font-bold text-[#FF4D6D]">
                    {showBalance ? formatPrice(monthExpense, currency) : '••••'}
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Quick Actions Row */}
        <View className="mb-4 flex-row gap-2.5">
          {QUICK_ACTIONS.map(item => {
            const Icon = item.icon
            return (
              <TouchableOpacity
                key={item.label}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
                  router.push({
                    pathname: '/(root)/(tabs)/add-transaction',
                    params: { action: item.action },
                  })
                }}
                activeOpacity={0.75}
                className="flex-1 items-center rounded-2xl border border-white/10 bg-[#111420] p-3 shadow-lg"
              >
                <View
                  className="mb-2 h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: item.bgColor }}
                >
                  <Icon size={18} color={item.color} strokeWidth={2.2} />
                </View>
                <Text className="text-xs font-bold text-white">{item.label}</Text>
                <Text className="text-[10px] text-slate-400">{item.sub}</Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* AI Financial Copilot Banner */}
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
            router.push('/(root)/(tabs)/assistant')
          }}
          activeOpacity={0.85}
          className="mb-4 overflow-hidden rounded-2xl border border-[#00D2FF]/20"
        >
          <LinearGradient
            colors={['rgba(59, 130, 246, 0.15)', 'rgba(168, 85, 247, 0.1)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="flex-row items-center gap-3 p-3.5"
          >
            <View className="h-8 w-8 items-center justify-center rounded-full border border-[#00E599]/40 bg-[#00E599]/20">
              <Sparkles size={16} color="#00E599" />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-bold tracking-wide text-white">Wallex Copilot</Text>
              <Text className="text-[11px] text-slate-300">
                Ask AI: &quot;Analyze my spending trends this month&quot;
              </Text>
            </View>
            <ArrowRight size={16} color="#94A3B8" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Monthly Budget Card */}
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
            setBudgetModalOpen(true)
          }}
          activeOpacity={0.85}
          className="mb-4 rounded-2xl border border-white/10 bg-[#111420] p-4 shadow-xl"
        >
          <View className="mb-3 flex-row items-center justify-between">
            <View>
              <Text className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Monthly Budget
              </Text>
              {budget ? (
                <Text className="mt-0.5 text-xs text-slate-400">
                  {formatPrice(monthExpense, currency)} spent of{' '}
                  {formatPrice(budget.amount, currency)}
                </Text>
              ) : (
                <Text className="mt-0.5 text-xs text-slate-400">
                  Set a limit to automatically track caps
                </Text>
              )}
            </View>
            <View className="flex-row items-center gap-1 rounded-full border border-[#00E599]/30 bg-[#00E599]/15 px-2.5 py-1">
              <Edit2 size={11} color="#00E599" />
              <Text className="text-[10px] font-bold text-[#00E599]">
                {budget ? 'Adjust' : 'Set'}
              </Text>
            </View>
          </View>

          {budget && (
            <View>
              <View className="mb-2 h-2 overflow-hidden rounded-full bg-slate-800">
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(Math.round((monthExpense / budget.amount) * 100), 100)}%`,
                    backgroundColor:
                      monthExpense >= budget.amount
                        ? '#FF4D6D'
                        : monthExpense >= budget.amount * 0.8
                          ? '#FBBF24'
                          : '#00E599',
                  }}
                />
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-[10px] font-bold text-slate-300">
                  {Math.round((monthExpense / budget.amount) * 100)}% Used
                </Text>
                <Text className="text-[10px] font-medium text-slate-400">
                  {budget.amount - monthExpense > 0
                    ? `${formatPrice(budget.amount - monthExpense, currency)} left`
                    : 'Budget exceeded'}
                </Text>
              </View>
            </View>
          )}
        </TouchableOpacity>

        {/* Expense Breakdown Visualizer */}
        {expenseBreakdown.length > 0 && (
          <View className="mb-4 rounded-2xl border border-white/10 bg-[#111420] p-4 shadow-xl">
            <Text className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-300">
              Spending Breakdown
            </Text>
            <View className="flex-row items-center justify-between">
              <PieChart
                data={expenseBreakdown.map(c => ({
                  value: c.amount,
                  color: c.color,
                }))}
                radius={56}
                innerRadius={36}
                innerCircleColor="#111420"
                centerLabelComponent={() => (
                  <View className="items-center justify-center">
                    <Text className="text-base font-black text-white">
                      {expenseBreakdown.length}
                    </Text>
                    <Text className="text-[9px] text-slate-400">Cats</Text>
                  </View>
                )}
              />

              <View className="ml-4 flex-1 gap-2">
                {expenseBreakdown.slice(0, 4).map(c => (
                  <View key={c.category} className="flex-row items-center justify-between">
                    <View className="mr-2 flex-1 flex-row items-center gap-2">
                      <View
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: c.color }}
                      />
                      <Text className="text-xs font-medium text-slate-300" numberOfLines={1}>
                        {getCategoryConfig(c.category).label}
                      </Text>
                    </View>
                    <Text className="text-xs font-bold text-white">
                      {formatPrice(c.amount, currency)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Recent Activity Section */}
        <View className="mb-6">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-xs font-bold uppercase tracking-wider text-slate-300">
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
            <View className="items-center rounded-2xl border border-white/10 bg-[#111420] p-6">
              <Inbox size={32} color="#64748B" />
              <Text className="mt-2 text-sm font-semibold text-white">No recent transactions</Text>
              <Text className="mt-1 text-xs text-slate-400">
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
