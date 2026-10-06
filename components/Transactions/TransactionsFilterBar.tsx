import React from 'react'
import { ScrollView, Text, TextInput, TouchableOpacity, View, Platform } from 'react-native'
import { Search, X, Wallet } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import { Account } from '@/types'

const FILTERS = ['All', 'Income', 'Expenses'] as const
export type FilterType = (typeof FILTERS)[number]

export function TransactionsFilterBar({
  search,
  onSearchChange,
  activeFilter,
  onFilterChange,
  accounts,
  activeAccountId,
  onAccountChange,
}: {
  search: string
  onSearchChange: (text: string) => void
  activeFilter: FilterType
  onFilterChange: (filter: FilterType) => void
  accounts: Account[]
  activeAccountId: string | null
  onAccountChange: (accountId: string | null) => void
}) {
  return (
    <View className="mb-4 gap-3">
      {/* Search Input Bar */}
      <View className="flex-row items-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-md dark:border-white/10 dark:bg-[#111420]">
        <Search size={16} color="#64748B" />
        <TextInput
          value={search}
          onChangeText={onSearchChange}
          placeholder="Search by note or category…"
          placeholderTextColor="#64748B"
          className="ml-2.5 flex-1 p-0 text-sm text-slate-900 outline-none focus:outline-none dark:text-white"
          style={
            Platform.OS === 'web' ? ({ outlineStyle: 'none', outline: 'none' } as any) : undefined
          }
        />
        {search ? (
          <TouchableOpacity
            onPress={() => onSearchChange('')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <X size={15} color="#94A3B8" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filter Segmented Pills (All / Income / Expenses) */}
      <View className="flex-row gap-2">
        {FILTERS.map(f => {
          const isSelected = activeFilter === f
          return (
            <TouchableOpacity
              key={f}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
                onFilterChange(f)
              }}
              activeOpacity={0.75}
              className={`flex-1 items-center justify-center rounded-xl border py-2 ${
                isSelected
                  ? 'border-[#00E599] bg-[#00E599]'
                  : 'border-slate-200 bg-white dark:border-white/10 dark:bg-[#111420]'
              }`}
            >
              <Text
                className={`text-xs ${
                  isSelected
                    ? 'font-bold text-[#08090D]'
                    : 'font-semibold text-slate-700 dark:text-slate-400'
                }`}
              >
                {f}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>

      {/* Account Pills (Scrollable) */}
      {accounts.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
              onAccountChange(null)
            }}
            activeOpacity={0.7}
            className={`flex-row items-center gap-1.5 rounded-xl border px-3 py-1.5 ${
              activeAccountId === null
                ? 'border-[#00E599]/60 bg-[#00E599]/15'
                : 'border-slate-200 bg-white dark:border-white/10 dark:bg-[#111420]'
            }`}
          >
            <Wallet size={13} color={activeAccountId === null ? '#00E599' : '#64748B'} />
            <Text
              className={`text-xs ${
                activeAccountId === null
                  ? 'font-bold text-[#00E599]'
                  : 'font-semibold text-slate-700 dark:text-slate-400'
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
                  onAccountChange(isSelected ? null : account.id)
                }}
                activeOpacity={0.7}
                className={`flex-row items-center gap-1.5 rounded-xl border px-3 py-1.5 ${
                  isSelected
                    ? 'border-[#00E599]/60 bg-[#00E599]/15'
                    : 'border-slate-200 bg-white dark:border-white/10 dark:bg-[#111420]'
                }`}
              >
                <Text
                  className={`text-xs ${
                    isSelected
                      ? 'font-bold text-[#00E599]'
                      : 'font-semibold text-slate-700 dark:text-slate-400'
                  }`}
                >
                  {account.name}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      )}
    </View>
  )
}
