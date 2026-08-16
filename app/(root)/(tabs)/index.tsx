import { useAuth, useUser } from '@clerk/expo'
import { useRouter } from 'expo-router'
import { View, Text, Image, TouchableOpacity, Alert } from 'react-native'

const HomeScreen = () => {
  const { signOut } = useAuth()
  const { user } = useUser()
  const router = useRouter()

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

  const primaryEmail = user?.primaryEmailAddress?.emailAddress
  const fullName = user?.fullName || user?.firstName || 'User'
  const imageUrl = user?.imageUrl

  return (
    <View className="flex-1 bg-white p-5">
      {/* Minimal Profile Card */}
      <View className="mb-6 items-center rounded-2xl border border-[#E8E6DF] bg-[#FDFBF7] p-6 shadow-sm">
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            className="mb-3 h-20 w-20 rounded-full border border-gray-200"
          />
        ) : (
          <View className="mb-3 h-20 w-20 items-center justify-center rounded-full bg-slate-800">
            <Text className="text-2xl font-bold text-white">
              {fullName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        <Text className="text-xl font-bold text-gray-900">{fullName}</Text>
        {primaryEmail && <Text className="mt-1 text-sm text-gray-500">{primaryEmail}</Text>}
      </View>

      {/* Account Actions */}
      <View className="overflow-hidden rounded-2xl border border-[#E8E6DF]">
        <TouchableOpacity
          onPress={handleSignOut}
          activeOpacity={0.7}
          className="flex-row items-center justify-between bg-white p-4 active:bg-red-50"
        >
          <Text className="text-base font-semibold text-red-600">Sign out</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default HomeScreen
