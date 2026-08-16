import { useAuth, useUser } from '@clerk/expo'
import { useRouter } from 'expo-router'
import { Alert, SafeAreaView, Text, TouchableOpacity, View } from 'react-native'

export default function ProfileScreen() {
  const { user } = useUser()
  const { signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut()
            router.replace('/')
          } catch (error) {
            console.error('Sign out failed:', error)

            Alert.alert('Sign out failed', 'Something went wrong. Please try again.')
          }
        },
      },
    ])
  }

  return (
    <SafeAreaView className="flex-1 bg-brand-body">
      <View className="flex-1 items-center justify-center p-6">
        <Text className="mb-2 text-xl font-bold text-white">Profile</Text>

        {user ? (
          <Text className="mb-6 text-sm text-gray-300">
            {user.emailAddresses?.[0]?.emailAddress ?? 'Signed in'}
          </Text>
        ) : null}

        <TouchableOpacity
          onPress={handleSignOut}
          activeOpacity={0.8}
          className="rounded-lg bg-red-500 px-4 py-3"
        >
          <Text className="font-semibold text-white">Sign out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}
