import { Tabs } from 'expo-router'
import { ProTabBar } from '@/components/Shared/ProTabBar'

export default function TabLayout() {
  return (
    <Tabs
      tabBar={props => <ProTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Activity',
        }}
      />
      <Tabs.Screen
        name="add-transaction"
        options={{
          title: 'Add',
        }}
      />
      <Tabs.Screen
        name="assistant"
        options={{
          title: 'Copilot',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  )
}
