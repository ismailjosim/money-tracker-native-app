import { View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const OnboardingScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-brand-body" edges={['top']}>
      <Text>onboarding</Text>
    </SafeAreaView>
  )
}

export default OnboardingScreen
