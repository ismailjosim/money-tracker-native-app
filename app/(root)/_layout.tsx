import { useUserSync } from '@/hooks/useUserSync'
import { useUserStore } from '@/store/useStore'
import { useAuth } from '@clerk/expo'
import { Redirect, Slot, usePathname } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'

export default function RootGroupLayout() {
  const { isSignedIn, isLoaded } = useAuth()
  const needOnboarding = useUserStore(state => state.needOnboarding)
  const pathname = usePathname()
  const [minLoadDone, setMinLoadDone] = useState(false)

  useUserSync()
  useEffect(() => {
    const id = setTimeout(() => setMinLoadDone(true), 1500)
    return () => clearTimeout(id)
  }, [])

  if (!isLoaded) return null
  if (!isSignedIn) return <Redirect href="/sign-in" />

  if (minLoadDone && needOnboarding === null) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#08090D',
        }}
      >
        <ActivityIndicator size="large" color="#00E599" />
      </View>
    )
  }

  if (needOnboarding && pathname !== '/onboarding') {
    return <Redirect href="/(root)/onboarding" />
  }

  return <Slot />
}
