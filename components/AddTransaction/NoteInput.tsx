import React from 'react'
import { Text, TextInput, View, Platform } from 'react-native'
import { Control, Controller } from 'react-hook-form'
import { FileText } from 'lucide-react-native'
import { TransactionFormValues } from '@/lib/schemas/transaction'

export function NoteInput({ control }: { control: Control<TransactionFormValues> }) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Note (Optional)
      </Text>
      <View className="flex-row items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-[#111420]">
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
              placeholderTextColor="#94A3B8"
              className="flex-1 p-0 text-sm text-slate-900 outline-none focus:outline-none dark:text-white"
              style={
                Platform.OS === 'web'
                  ? ({ outlineStyle: 'none', outline: 'none' } as any)
                  : undefined
              }
            />
          )}
        />
      </View>
    </View>
  )
}
