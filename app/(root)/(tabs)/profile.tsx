import React, { useState } from 'react'
import { ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import { useClerk, useUser } from '@clerk/expo'
import * as Haptics from 'expo-haptics'
import { ChevronRight, DollarSign, Lock, LogOut, Moon, Sun } from 'lucide-react-native'
import { useAppTheme } from '@/hooks/useAppTheme'

import { AccountModal } from '@/components/Profile/AccountModal'
import { ProfileHeader } from '@/components/Profile/ProfileHeader'
import { ConnectedAccountsList } from '@/components/Profile/ConnectedAccountsList'
import SectionLabel from '@/components/Profile/SectionLabel'
import { useSetDefaultAccount } from '@/hooks/mutations/useAccountMutations'
import { useAccountsQuery } from '@/hooks/queries/useAccountsQuery'
import useSupabase from '@/hooks/useSupabase'
import { Account } from '@/lib/services/accounts'
import { useUserStore } from '@/store/useStore'
import { CurrencyPicker } from '@/components/Shared/CurrencyPicker'
import { ConfirmDialog } from '@/components/Shared/ConfirmDialog'
import { toast } from '@/store/useToastStore'
import { router } from 'expo-router'

export default function ProfileScreen() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const supabase = useSupabase()
  const { isDark, toggleTheme } = useAppTheme()

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
  const [signOutConfirmOpen, setSignOutConfirmOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  const closeModal = () => {
    setModalVisible(false)
    setEditingAccount(null)
  }

  const handlePickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) {
      toast.error('Permission needed to access photo library')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
      base64: true,
    })

    if (result.canceled || !result.assets[0]?.base64) return

    setUploadingAvatar(true)
    try {
      const mime = result.assets[0].mimeType || 'image/jpeg'
      const base64Data = `data:${mime};base64,${result.assets[0].base64}`
      await user?.setProfileImage({ file: base64Data })
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})
      toast.success('Avatar updated successfully')
    } catch {
      toast.error('Could not update avatar')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleMadeDefault = async () => {
    if (!editingAccount) return
    try {
      await setDefaultAccount(editingAccount.id)
      toast.success(`"${editingAccount.name}" set as default account`)
      closeModal()
    } catch {
      toast.error("Couldn't set as default account")
    }
  }

  const handleCurrencySelect = async ({ code }: { code: string }) => {
    setCurrency(code)
    setCurrencyPickerOpen(false)
    toast.success(`Currency set to ${code}`)
    if (!user) return

    await supabase.from('users').update({ currency: code }).eq('clerk_id', user.id)
  }

  const performSignOut = async () => {
    setSigningOut(true)
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})
      useUserStore.getState().setNeedOnboarding(null)
      await signOut()
      setSignOutConfirmOpen(false)
      toast.success('Signed out of Wallex')
      router.replace('/sign-in')
    } catch (e) {
      console.error('Sign out error:', e)
      toast.error('Could not sign out')
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-[#08090D]" edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* Header Title */}
        <View className="px-5 pb-3 pt-2">
          <Text className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
            Settings & Profile
          </Text>
        </View>

        {/* User Identity Card */}
        <ProfileHeader
          user={user ?? null}
          uploadingAvatar={uploadingAvatar}
          onPickAvatar={handlePickAvatar}
        />

        {/* Connected Accounts */}
        <SectionLabel>Connected Accounts</SectionLabel>
        <ConnectedAccountsList
          accounts={accounts}
          currency={currency}
          loading={loadingAccounts}
          error={accountsError}
          onSelectAccount={account => {
            setEditingAccount(account)
            setModalVisible(true)
          }}
          onAddAccount={() => {
            setEditingAccount(null)
            setModalVisible(true)
          }}
        />

        {/* Preferences */}
        <SectionLabel>Preferences</SectionLabel>
        <View className="mx-4 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#111420]">
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
              setCurrencyPickerOpen(true)
            }}
            activeOpacity={0.7}
            className="flex-row items-center border-b border-slate-100 px-4 py-3.5 dark:border-white/[0.04]"
          >
            <View className="mr-3 h-8 w-8 items-center justify-center rounded-lg bg-[#00E599]/10">
              <DollarSign size={16} color="#00E599" />
            </View>
            <Text className="flex-1 text-sm font-semibold text-slate-900 dark:text-white">
              Display Currency
            </Text>
            <View className="mr-1.5 rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1 dark:border-white/10 dark:bg-[#161B2A]">
              <Text className="text-xs font-bold text-[#00E599]">{currency}</Text>
            </View>
            <ChevronRight size={16} color="#64748B" />
          </TouchableOpacity>

          <View className="flex-row items-center border-b border-slate-100 px-4 py-3.5 dark:border-white/[0.04]">
            <View className="mr-3 h-8 w-8 items-center justify-center rounded-lg bg-[#00E599]/10">
              <Lock size={16} color="#00E599" />
            </View>
            <Text className="flex-1 text-sm font-semibold text-slate-900 dark:text-white">
              Biometric Security Lock
            </Text>
            <Switch
              value={biometricLock}
              onValueChange={val => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
                setBiometricLock(val)
              }}
              thumbColor={biometricLock ? '#00E599' : '#94A3B8'}
              trackColor={{
                false: isDark ? '#1E2538' : '#E2E8F0',
                true: 'rgba(0, 229, 153, 0.3)',
              }}
            />
          </View>

          {/* Theme Mode Toggle (Light / Dark) */}
          <View className="flex-row items-center px-4 py-3.5">
            <View className="mr-3 h-8 w-8 items-center justify-center rounded-lg bg-[#00E599]/10">
              {isDark ? <Moon size={16} color="#00E599" /> : <Sun size={16} color="#F59E0B" />}
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-slate-900 dark:text-white">
                Dark Theme
              </Text>
              <Text className="text-[11px] text-slate-500 dark:text-slate-400">
                {isDark ? 'Dark mode enabled' : 'Light mode enabled'}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={val => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {})
                toggleTheme()
                toast.info(`${val ? 'Dark' : 'Light'} theme enabled`)
              }}
              thumbColor={isDark ? '#00E599' : '#F59E0B'}
              trackColor={{
                false: isDark ? '#1E2538' : '#E2E8F0',
                true: 'rgba(0, 229, 153, 0.3)',
              }}
            />
          </View>
        </View>

        {/* Session Section */}
        <SectionLabel>Session</SectionLabel>
        <View className="mx-4 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#111420]">
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {})
              setSignOutConfirmOpen(true)
            }}
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

      <ConfirmDialog
        visible={signOutConfirmOpen}
        title="Sign Out of Wallex?"
        message="Are you sure you want to end your current session? You can sign back in anytime."
        confirmText="Sign Out"
        cancelText="Cancel"
        icon="logout"
        destructive
        loading={signingOut}
        onConfirm={performSignOut}
        onCancel={() => setSignOutConfirmOpen(false)}
      />
    </SafeAreaView>
  )
}
