import React, { useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useUser } from '@clerk/expo'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { Sparkles, ArrowUp, User as UserIcon, HelpCircle } from 'lucide-react-native'

import { ChatMessage } from '@/components/Assistant/MessageBubble'
import { useBudgetQuery } from '@/hooks/queries/useBudgetQuery'
import { useTransactionsQuery } from '@/hooks/queries/useTransactionsQuery'
import { askAssistant } from '@/lib/services/assistant'
import { useUserStore } from '@/store/useStore'

const SUGGESTED_PROMPTS = [
  'How much did I spend on food this month?',
  "What's my biggest expense category?",
  'Am I on track with my monthly budget?',
  'Where can I optimize $100 this week?',
]

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome',
    role: 'assistant',
    content:
      'Hello! I am your Wallex AI Copilot. I analyze your spending, accounts, and budgets in real time. How can I help you today?',
  },
]

function ProMessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <View className="mb-3.5 flex-row items-end justify-end gap-2">
        <View className="max-w-[80%] rounded-[18px] rounded-br-sm bg-[#00E599] px-3.5 py-2.5">
          <Text className="text-sm font-semibold leading-5 text-[#08090D]">{message.content}</Text>
        </View>
        <View className="h-6 w-6 items-center justify-center rounded-full bg-[#00E599]">
          <UserIcon size={12} color="#08090D" />
        </View>
      </View>
    )
  }

  return (
    <View className="mb-3.5 flex-row items-start gap-2.5">
      <View className="mt-0.5 h-7 w-7 items-center justify-center rounded-full border border-[#00E599]/30 bg-[#00E599]/15">
        <Sparkles size={14} color="#00E599" />
      </View>
      <View className="flex-1 rounded-[18px] rounded-tl-sm border border-white/10 bg-[#111420] px-4 py-3">
        <View className="mb-1.5 flex-row items-center gap-1.5">
          <Text className="text-xs font-bold text-[#00E599]">Wallex AI</Text>
        </View>
        <Text className="text-sm font-normal leading-5 text-slate-100">{message.content}</Text>
      </View>
    </View>
  )
}

export default function AssistantScreen() {
  const { user } = useUser()
  const currency = useUserStore(s => s.currency)
  const { refetch: refetchTransactions } = useTransactionsQuery()
  const { refetch: refetchBudget } = useBudgetQuery()

  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)

  const sendMessage = async (text: string) => {
    if (!text.trim() || sending || !user) return

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setSending(true)

    try {
      const [{ data: transactions = [] }, { data: budget = null }] = await Promise.all([
        refetchTransactions(),
        refetchBudget(),
      ])
      const reply = await askAssistant(text, transactions, budget, currency)

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})

      setMessages(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: reply },
      ])
    } catch (err) {
      console.error('Assistant error:', err)
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content:
            'I ran into an issue analyzing that request. Please verify your connection and try again.',
        },
      ])
    } finally {
      setSending(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-[#08090D]" edges={['top']}>
      {/* Top Header */}
      <View className="flex-row items-center justify-between border-b border-white/[0.04] px-5 pb-3.5 pt-2.5">
        <View>
          <Text className="text-xl font-black tracking-tight text-white">AI Copilot</Text>
          <Text className="mt-0.5 text-[11px] text-slate-400">Smart Financial Intelligence</Text>
        </View>

        <View className="flex-row items-center gap-1.5 rounded-full border border-[#00E599]/30 bg-[#00E599]/10 px-2.5 py-1">
          <View className="h-1.5 w-1.5 rounded-full bg-[#00E599]" />
          <Text className="text-[10px] font-bold text-[#00E599]">Gemini AI</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
        className="flex-1"
      >
        <FlatList
          data={messages}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <ProMessageBubble message={item} />}
          contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: 20 }}
          ListFooterComponent={
            sending ? (
              <View className="mb-3.5 flex-row items-start gap-2.5">
                <View className="mt-0.5 h-7 w-7 items-center justify-center rounded-full border border-[#00E599]/30 bg-[#00E599]/15">
                  <Sparkles size={14} color="#00E599" />
                </View>
                <View className="flex-row items-center gap-2.5 rounded-[18px] rounded-tl-sm border border-white/10 bg-[#111420] px-4 py-3">
                  <ActivityIndicator size="small" color="#00E599" />
                  <Text className="text-xs font-medium text-slate-400">
                    Analyzing financial ledger...
                  </Text>
                </View>
              </View>
            ) : null
          }
        />

        {/* Suggested Prompt Chips */}
        {messages.length <= 1 && (
          <View className="mb-2.5 px-5">
            <View className="mb-2 flex-row items-center gap-1.5">
              <HelpCircle size={13} color="#94A3B8" />
              <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Suggested Prompts
              </Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {SUGGESTED_PROMPTS.map(prompt => (
                <TouchableOpacity
                  key={prompt}
                  onPress={() => sendMessage(prompt)}
                  activeOpacity={0.75}
                  className="flex-row items-center gap-1.5 rounded-xl border border-white/10 bg-[#111420] px-3 py-2"
                >
                  <Sparkles size={11} color="#00E599" />
                  <Text className="text-xs font-medium text-slate-300">{prompt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Input Bar */}
        <View className="px-4 pb-24 pt-2">
          <View className="flex-row items-center rounded-2xl border border-white/10 bg-[#111420] px-3.5 py-1.5 shadow-xl">
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Ask anything about your money..."
              placeholderTextColor="#64748B"
              editable={!sending}
              className="flex-1 py-2 text-sm text-white outline-none focus:outline-none"
              style={
                Platform.OS === 'web'
                  ? ({ outlineStyle: 'none', outline: 'none' } as any)
                  : undefined
              }
              onSubmitEditing={() => sendMessage(input)}
              returnKeyType="send"
            />
            <TouchableOpacity
              onPress={() => sendMessage(input)}
              disabled={sending || !input.trim()}
              activeOpacity={0.8}
              className={`ml-2 overflow-hidden rounded-xl ${
                sending || !input.trim() ? 'opacity-40' : 'opacity-100'
              }`}
            >
              <LinearGradient
                colors={['#00E599', '#00B4D8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="h-9 w-9 items-center justify-center rounded-xl"
              >
                <ArrowUp size={18} color="#08090D" strokeWidth={2.8} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
