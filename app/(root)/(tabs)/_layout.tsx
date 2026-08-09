import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs'

export default function TabLayout() {
	return (
		<NativeTabs>
			<NativeTabs.Trigger name='index'>
				<Label>Home</Label>
				<Icon sf='house.fill' />
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name='transactions'>
				<Label>Transactions</Label>
				<Icon sf='list.bullet' />
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name='add-transaction'>
				<Label>Add Transaction</Label>
				<Icon sf='plus.circle.fill' />
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name='assistant'>
				<Label>ssistant</Label>
				<Icon sf='plus.circle.fill' />
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name='profile'>
				<Label>Profile</Label>
				<Icon sf='gear' />
			</NativeTabs.Trigger>
		</NativeTabs>
	)
}
