import { useAuth } from '@clerk/expo'
import { Redirect, Stack } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'

export default function AuthLayout() {
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-brand-body">
        <ActivityIndicator size="large" color="#253BCE" />
      </View>
    )
  }

  if (isSignedIn) {
    return <Redirect href={'/'} />
  }
  return <Stack screenOptions={{ headerShown: false }} />
}
