import React, { useMemo, useState } from 'react'
import { FlatList, Modal, Text, TextInput, TouchableOpacity, View, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import cc from 'currency-codes'
import getSymbol from 'currency-symbol-map'
import * as Haptics from 'expo-haptics'
import { Check, Search, X } from 'lucide-react-native'

export type CurrencyEntry = { code: string; name: string; symbol: string }

export const ALL_CURRENCIES: CurrencyEntry[] = cc
  .codes()
  .map(code => ({
    code,
    name: cc.code(code)?.currency ?? code,
    symbol: getSymbol(code) ?? code,
  }))
  .filter(c => c.symbol !== c.code)

export function CurrencyPicker({
  visible,
  selectedCode,
  onSelect,
  onClose,
}: {
  visible: boolean
  selectedCode: string
  onSelect: (currency: CurrencyEntry) => void
  onClose: () => void
}) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return ALL_CURRENCIES
    return ALL_CURRENCIES.filter(
      c => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
    )
  }, [search])

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView className="flex-1 bg-slate-50 dark:bg-[#08090D]" edges={['top']}>
        {/* Search Header */}
        <View className="flex-row items-center gap-3 border-b border-slate-200 px-4 py-3 dark:border-white/[0.06]">
          <View className="flex-1 flex-row items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 dark:border-white/10 dark:bg-[#111420]">
            <Search size={16} color="#94A3B8" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search currency code or name…"
              placeholderTextColor="#64748B"
              autoFocus
              className="flex-1 p-0 text-sm text-slate-900 outline-none focus:outline-none dark:text-white"
              style={
                Platform.OS === 'web'
                  ? ({ outlineStyle: 'none', outline: 'none' } as any)
                  : undefined
              }
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <X size={15} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            onPress={() => {
              setSearch('')
              onClose()
            }}
            className="px-1 py-1"
          >
            <Text className="text-sm font-semibold text-[#00E599]">Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* Currency List */}
        <FlatList
          data={filtered}
          keyExtractor={item => item.code}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => {
            const isSelected = item.code === selectedCode
            return (
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
                  onSelect(item)
                  setSearch('')
                }}
                activeOpacity={0.7}
                className={`flex-row items-center border-b border-slate-100 px-4 py-3.5 dark:border-white/[0.03] ${
                  isSelected ? 'bg-[#00E599]/10' : ''
                }`}
              >
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 dark:border-white/5 dark:bg-[#161B2A]">
                  <Text className="text-base font-bold text-[#00E599]">{item.symbol}</Text>
                </View>

                <View className="flex-1">
                  <Text className="text-sm font-bold text-slate-900 dark:text-white">
                    {item.code}
                  </Text>
                  <Text
                    className="mt-0.5 text-xs text-slate-500 dark:text-slate-400"
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                </View>

                {isSelected && <Check size={18} color="#00E599" strokeWidth={2.5} />}
              </TouchableOpacity>
            )
          }}
        />
      </SafeAreaView>
    </Modal>
  )
}
