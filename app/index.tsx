import { useAuth } from '@clerk/expo'
import { Redirect } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'

const MainScreen = () => {
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-brand-body">
        <ActivityIndicator size="large" color="#253BCE" />
      </View>
    )
  }

  if (isSignedIn) {
    return <Redirect href={'/(root)/(tabs)'} />
  }
  return <Redirect href={'/sign-in'} />
}

export default MainScreen
