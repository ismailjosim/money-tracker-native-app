import React from 'react'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'
import { Building2, ChevronRight, CreditCard, Landmark, Plus, Wallet } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import { Account, AccountType } from '@/lib/services/accounts'
import { formatPrice } from '@/lib/utils/utils'

const ACCOUNT_ICON: Record<AccountType, React.ComponentType<{ size: number; color: string }>> = {
  CASH: Wallet,
  BANK: Landmark,
  CREDIT_CARD: CreditCard,
  SAVINGS: Building2,
}

export function ConnectedAccountsList({
  accounts,
  currency,
  loading,
  error,
  onSelectAccount,
  onAddAccount,
}: {
  accounts: Account[]
  currency: string
  loading: boolean
  error: boolean
  onSelectAccount: (account: Account) => void
  onAddAccount: () => void
}) {
  return (
    <View className="mx-4 overflow-hidden rounded-2xl border border-white/10 bg-[#111420]">
      {loading ? (
        <View className="items-center justify-center py-8">
          <ActivityIndicator color="#00E599" size="small" />
        </View>
      ) : error ? (
        <View className="items-center justify-center py-8">
          <Text className="text-xs text-[#FF4D6D]">Couldn&apos;t load your accounts.</Text>
        </View>
      ) : (
        accounts.map(account => {
          const IconComponent = ACCOUNT_ICON[account.type] || Landmark
          return (
            <TouchableOpacity
              key={account.id}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
                onSelectAccount(account)
              }}
              activeOpacity={0.7}
              className="flex-row items-center border-b border-white/[0.04] px-4 py-3.5"
            >
              <View className="mr-3 h-8 w-8 items-center justify-center rounded-lg bg-[#00E599]/10">
                <IconComponent size={16} color="#00E599" />
              </View>

              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <Text className="text-sm font-semibold text-white">{account.name}</Text>
                  {account.is_default && (
                    <View className="rounded border border-[#00E599]/30 bg-[#00E599]/15 px-1.5 py-0.5">
                      <Text className="text-[9px] font-bold text-[#00E599]">DEFAULT</Text>
                    </View>
                  )}
                </View>
                <Text className="mt-0.5 text-[11px] text-slate-400">{account.type}</Text>
              </View>

              <Text className="mr-1.5 text-sm font-bold text-white">
                {formatPrice(account.balance, currency)}
              </Text>
              <ChevronRight size={16} color="#64748B" />
            </TouchableOpacity>
          )
        })
      )}

      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
          onAddAccount()
        }}
        activeOpacity={0.7}
        className="flex-row items-center bg-white/[0.02] px-4 py-3.5"
      >
        <View className="mr-3 h-7 w-7 items-center justify-center rounded-lg bg-[#00E599]">
          <Plus size={16} color="#08090D" strokeWidth={2.8} />
        </View>
        <Text className="flex-1 text-sm font-semibold text-[#00E599]">Add New Account</Text>
        <ChevronRight size={16} color="#64748B" />
      </TouchableOpacity>
    </View>
  )
}
