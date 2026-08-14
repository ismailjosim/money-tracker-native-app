import { useAuth } from '@clerk/expo'
import { Redirect } from 'expo-router'

const MainScreen = () => {
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) {
    return null
  }

  if (isSignedIn) {
    return <Redirect href={'/(root)/(tabs)'} />
  }
  return <Redirect href={'/sign-in'} />
}

export default MainScreen
