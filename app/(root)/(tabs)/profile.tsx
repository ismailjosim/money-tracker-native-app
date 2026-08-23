import { useSetDefaultAccount } from '@/hooks/mutations/useAccountMutations'
import { useAccountsQuery } from '@/hooks/queries/useAccountsQuery'
import useSupabase from '@/hooks/useSupabase'
import { useUserStore } from '@/store/useStore'
import { Account, AccountType } from '@/types'
import { useAuth, useUser } from '@clerk/expo'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, Alert, Switch, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import { Image } from 'expo-image'
import { ScrollView } from 'react-native-gesture-handler'
import SectionLabel from '@/components/Profile/SectionLabel'
import Row from '@/components/Profile/Row'
import { formatPrice } from '@/lib/utils/utils'
import { AccountModal } from '@/components/Profile/AccountModal'
import { CurrencyPicker } from '@/components/Shared/CurrencyPicker'

const ACCOUNT_ICON: Record<AccountType, keyof typeof Feather.glyphMap> = {
  CASH: 'dollar-sign',
  BANK: 'home',
  CREDIT_CARD: 'credit-card',
  SAVINGS: 'shield',
}

const ProfileScreen = () => {
  const { user } = useUser()
  const { signOut } = useAuth()
  const router = useRouter()

  const supabase = useSupabase()
  const currency = useUserStore(state => state.currency)
  const setCurrency = useUserStore(state => state.setCurrency)
  const [biometricLock, setBiometricLock] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [currencyPickerOpen, setCurrencyPickerOpen] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const {
    data: accounts = [],
    isLoading: loadingAccounts,
    isError: accountsError,
  } = useAccountsQuery()
  const { mutateAsync: setDefaultAccount } = useSetDefaultAccount()

  const closeModal = () => {
    setModalVisible(false)
    setEditingAccount(null)
  }

  const handlePickAvatar = async () => {
    if (!user) return

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to set a profile picture.')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    })
    if (result.canceled) return

    setUploadingAvatar(true)
    try {
      const asset = result.assets[0]
      const filename = asset.uri.split('/').pop() || 'avatar.jpg'
      const match = /\.(\w+)$/.exec(filename)
      const mimeType = match ? `image/${match[1]}` : 'image/jpeg'
      const dataUrl = `data:${mimeType};base64,${asset.base64}`

      await user.setProfileImage({ file: dataUrl })
    } catch (err) {
      console.error('Avatar upload failed:', err)
      Alert.alert('Error', "Couldn't upload your photo. Please try again.")
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
      Alert.alert('Error', "Couldn't set this as the default account.")
    }
  }

  const handleCurrencySelect = async (selected: { code: string }) => {
    setCurrencyPickerOpen(false)
    if (!user) return
    try {
      const { error } = await supabase
        .from('users')
        .update({ currency: selected.code })
        .eq('clerk_id', user.id)
      if (error) throw error
      setCurrency(selected.code)
    } catch {
      Alert.alert('Error', "Couldn't update your currency.")
    }
  }

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await signOut()
          router.replace('/sign-in')
        },
      },
    ])
  }

  return (
    <SafeAreaView className="flex-1 bg-brand-body" edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="px-5 pb-2 pt-3">
          <Text className="text-xl font-semibold text-brand-bg">Profile</Text>
        </View>

        <View className="mx-5 mt-2 items-center rounded-2xl bg-brand-bg px-5 py-6">
          <TouchableOpacity
            onPress={handlePickAvatar}
            disabled={uploadingAvatar}
            activeOpacity={0.8}
            className="h-20 w-20 items-center  justify-center overflow-hidden rounded-full border-2 border-[#2A2E3A] bg-[#1A1D26]"
          >
            {uploadingAvatar ? (
              <ActivityIndicator color="#8A8D96" />
            ) : user?.imageUrl && user.hasImage ? (
              <Image
                source={{ uri: user.imageUrl }}
                style={{ width: 80, height: 80 }}
                contentFit="cover"
              />
            ) : (
              <Feather name="user" size={30} color="#8A8D96" />
            )}
            <View className="absolute inset-x-0 bottom-0 h-6 items-center justify-center bg-black/50">
              <Feather name="camera" size={13} color="#F2EFE9" />
            </View>
          </TouchableOpacity>
          <Text className="mt-3.5 text-2xl font-bold text-white">
            {user?.firstName} {user?.lastName}
          </Text>
          <View className="mt-1 flex-row items-center gap-1.5">
            <Feather name="mail" size={11} color="#8A8D96" />
            <Text className="text-xs text-brand-text-secondary" numberOfLines={1}>
              {user?.emailAddresses?.[0]?.emailAddress}
            </Text>
          </View>
        </View>
        {/* Accounts */}
        <SectionLabel>Accounts</SectionLabel>
        <View className="mx-5 overflow-hidden rounded-2xl border border-[#E8E6DF]">
          {loadingAccounts ? (
            <View className="items-center bg-white px-4 py-5">
              <ActivityIndicator color="#5C5F68" />
            </View>
          ) : accountsError ? (
            <View className="items-center bg-white px-4 py-5">
              <Text className="text-xs text-brand-text-muted">
                Couldn&apos;t load your accounts.
              </Text>
            </View>
          ) : (
            accounts.map(account => (
              <Row
                key={account.id}
                icon={ACCOUNT_ICON[account.type]}
                label={account.name + (account.is_default ? ' (default)' : '')}
                value={formatPrice(account.balance, currency)}
                onPress={() => {
                  setEditingAccount(account)
                  setModalVisible(true)
                }}
              />
            ))
          )}
          <Row
            icon="plus"
            label="Add account"
            onPress={() => {
              setEditingAccount(null)
              setModalVisible(true)
            }}
          />
        </View>

        {/* Preferences */}
        <SectionLabel>Preferences</SectionLabel>
        <View className="mx-5 overflow-hidden rounded-2xl border border-[#E8E6DF]">
          <Row
            icon="dollar-sign"
            label="Currency"
            value={currency}
            onPress={() => setCurrencyPickerOpen(true)}
          />

          <View className="flex-row items-center bg-white px-4 py-3.5">
            <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-[#F5F4F0]">
              <Feather name="lock" size={15} color="#5C5F68" />
            </View>
            <Text className="flex-1 text-sm text-brand-bg">Biometric lock</Text>
            <Switch
              value={biometricLock}
              onValueChange={setBiometricLock}
              thumbColor={'#8A8D96'}
              trackColor={{ false: '#8A8D96', true: '#E8E6DF' }}
            />
          </View>
        </View>

        {/* Account actions */}
        <SectionLabel>Account</SectionLabel>
        <View className="mx-5 overflow-hidden rounded-2xl border border-[#E8E6DF]">
          <Row icon="log-out" label="Sign out" onPress={handleSignOut} showChevron={false} danger />
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

export default ProfileScreen
