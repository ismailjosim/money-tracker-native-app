import React, { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import { useClerk, useUser } from '@clerk/expo'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import {
  Building2,
  Camera,
  ChevronRight,
  CreditCard,
  DollarSign,
  Landmark,
  Lock,
  LogOut,
  Mail,
  Plus,
  Sparkles,
  Wallet,
} from 'lucide-react-native'
import { router } from 'expo-router'

import { AccountModal } from '@/components/Profile/AccountModal'
import SectionLabel from '@/components/Profile/SectionLabel'
import { useSetDefaultAccount } from '@/hooks/mutations/useAccountMutations'
import { useAccountsQuery } from '@/hooks/queries/useAccountsQuery'
import useSupabase from '@/hooks/useSupabase'
import { Account, AccountType } from '@/lib/services/accounts'
import { formatPrice } from '@/lib/utils/utils'
import { useUserStore } from '@/store/useStore'
import { CurrencyPicker } from '@/components/Shared/CurrencyPicker'

const ACCOUNT_ICON: Record<AccountType, React.ComponentType<{ size: number; color: string }>> = {
  CASH: Wallet,
  BANK: Landmark,
  CREDIT_CARD: CreditCard,
  SAVINGS: Building2,
}

export default function ProfileScreen() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const supabase = useSupabase()
  const currency = useUserStore(s => s.currency)
  const setCurrency = useUserStore(s => s.setCurrency)

  const {
    data: accounts = [],
    isLoading: loadingAccounts,
    isError: accountsError,
  } = useAccountsQuery()
  const { mutateAsync: setDefaultAccount } = useSetDefaultAccount()

  const [modalVisible, setModalVisible] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [currencyPickerOpen, setCurrencyPickerOpen] = useState(false)
  const [biometricLock, setBiometricLock] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const closeModal = () => {
    setModalVisible(false)
    setEditingAccount(null)
  }

  const handlePickAvatar = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo library access to change your avatar.')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    })

    if (result.canceled || !result.assets[0]?.base64) return

    setUploadingAvatar(true)
    try {
      const mime = result.assets[0].mimeType || 'image/jpeg'
      const base64Data = `data:${mime};base64,${result.assets[0].base64}`
      await user?.setProfileImage({ file: base64Data })
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})
    } catch {
      Alert.alert('Upload Failed', 'Could not update your avatar. Please try again.')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleMadeDefault = async () => {
    if (!editingAccount) return
    try {
      await setDefaultAccount(editingAccount.id)
      closeModal()
    } catch {
      Alert.alert('Error', "Couldn't set as default account.")
    }
  }

  const handleCurrencySelect = async ({ code }: { code: string }) => {
    setCurrency(code)
    setCurrencyPickerOpen(false)
    if (!user) return

    await supabase.from('users').update({ currency: code }).eq('clerk_id', user.id)
  }

  const handleSignOut = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {})
    Alert.alert('Sign Out', 'Are you sure you want to log out of Wallex?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut()
          router.replace('/sign-in')
        },
      },
    ])
  }

  return (
    <SafeAreaView className="flex-1 bg-[#08090D]" edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* Header Title */}
        <View className="px-5 pb-3 pt-2">
          <Text className="text-xl font-black tracking-tight text-white">Settings & Profile</Text>
        </View>

        {/* User Identity Card */}
        <View className="mb-2.5 px-4">
          <LinearGradient
            colors={['#161D2E', '#0E121D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="items-center rounded-3xl border border-white/10 px-5 py-6 shadow-2xl"
          >
            <TouchableOpacity
              onPress={handlePickAvatar}
              disabled={uploadingAvatar}
              activeOpacity={0.8}
              className="relative h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-[#00E599]/40 bg-[#1E2538]"
            >
              {uploadingAvatar ? (
                <ActivityIndicator color="#00E599" />
              ) : user?.imageUrl && user.hasImage ? (
                <Image
                  source={{ uri: user.imageUrl }}
                  className="h-[74px] w-[74px] rounded-full"
                  contentFit="cover"
                />
              ) : (
                <View className="h-[74px] w-[74px] items-center justify-center rounded-full bg-[#161B29]">
                  <Text className="text-3xl font-black text-[#00E599]">
                    {(user?.firstName?.[0] || 'W').toUpperCase()}
                  </Text>
                </View>
              )}
              <View className="absolute bottom-0 left-0 right-0 h-5 items-center justify-center bg-black/65">
                <Camera size={11} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            <Text className="mt-3 text-lg font-bold text-white">
              {user?.firstName} {user?.lastName}
            </Text>

            <View className="mt-1 flex-row items-center gap-1.5">
              <Mail size={12} color="#94A3B8" />
              <Text className="text-xs text-slate-400" numberOfLines={1}>
                {user?.emailAddresses?.[0]?.emailAddress}
              </Text>
            </View>

            {/* Pro Tier Badge */}
            <View className="mt-3.5 flex-row items-center gap-1.5 rounded-full border border-[#00E599]/30 bg-[#00E599]/15 px-3 py-1">
              <Sparkles size={12} color="#00E599" />
              <Text className="text-[10px] font-bold tracking-wider text-[#00E599]">
                WALLEX PRO TIER
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Connected Accounts */}
        <SectionLabel>Connected Accounts</SectionLabel>
        <View className="mx-4 overflow-hidden rounded-2xl border border-white/10 bg-[#111420]">
          {loadingAccounts ? (
            <View className="items-center justify-center py-8">
              <ActivityIndicator color="#00E599" size="small" />
            </View>
          ) : accountsError ? (
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
                    setEditingAccount(account)
                    setModalVisible(true)
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
              setEditingAccount(null)
              setModalVisible(true)
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

        {/* Preferences */}
        <SectionLabel>Preferences</SectionLabel>
        <View className="mx-4 overflow-hidden rounded-2xl border border-white/10 bg-[#111420]">
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
              setCurrencyPickerOpen(true)
            }}
            activeOpacity={0.7}
            className="flex-row items-center border-b border-white/[0.04] px-4 py-3.5"
          >
            <View className="mr-3 h-8 w-8 items-center justify-center rounded-lg bg-[#00E599]/10">
              <DollarSign size={16} color="#00E599" />
            </View>
            <Text className="flex-1 text-sm font-semibold text-white">Display Currency</Text>
            <View className="mr-1.5 rounded-lg border border-white/10 bg-[#161B2A] px-2.5 py-1">
              <Text className="text-xs font-bold text-[#00E599]">{currency}</Text>
            </View>
            <ChevronRight size={16} color="#64748B" />
          </TouchableOpacity>

          <View className="flex-row items-center px-4 py-3.5">
            <View className="mr-3 h-8 w-8 items-center justify-center rounded-lg bg-[#00E599]/10">
              <Lock size={16} color="#00E599" />
            </View>
            <Text className="flex-1 text-sm font-semibold text-white">Biometric Security Lock</Text>
            <Switch
              value={biometricLock}
              onValueChange={val => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
                setBiometricLock(val)
              }}
              thumbColor={biometricLock ? '#00E599' : '#94A3B8'}
              trackColor={{ false: '#1E2538', true: 'rgba(0, 229, 153, 0.3)' }}
            />
          </View>
        </View>

        {/* Security & Session */}
        <SectionLabel>Session</SectionLabel>
        <View className="mx-4 overflow-hidden rounded-2xl border border-white/10 bg-[#111420]">
          <TouchableOpacity
            onPress={handleSignOut}
            activeOpacity={0.7}
            className="flex-row items-center px-4 py-3.5"
          >
            <View className="mr-3 h-8 w-8 items-center justify-center rounded-lg bg-[#FF4D6D]/15">
              <LogOut size={16} color="#FF4D6D" />
            </View>
            <Text className="text-sm font-semibold text-[#FF4D6D]">Sign Out of Wallex</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {user && (
        <AccountModal
          visible={modalVisible}
          account={editingAccount}
          onClose={closeModal}
          onSaved={closeModal}
          onDeleted={closeModal}
          onMadeDefault={handleMadeDefault}
        />
      )}

      <CurrencyPicker
        visible={currencyPickerOpen}
        selectedCode={currency}
        onSelect={handleCurrencySelect}
        onClose={() => setCurrencyPickerOpen(false)}
      />
    </SafeAreaView>
  )
}
