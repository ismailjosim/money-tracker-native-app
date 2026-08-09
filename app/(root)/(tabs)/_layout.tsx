import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import {
	Icon,
	Label,
	NativeTabs,
	VectorIcon,
} from 'expo-router/unstable-native-tabs'
import { Platform } from 'react-native'

const renderTabIcon = (iosSymbol: string, androidName: string) =>
	Platform.OS === 'ios' ? (
		<Icon sf={iosSymbol as any} />
	) : (
		<Icon
			androidSrc={
				<VectorIcon family={MaterialCommunityIcons} name={androidName as any} />
			}
		/>
	)
const TabLayout = () => {
	return (
		<NativeTabs>
			<NativeTabs.Trigger name='index'>
				<Label>Home</Label>
				{renderTabIcon('house.fill', 'home')}
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name='transactions'>
				<Label>Transactions</Label>
				{renderTabIcon('list.bullet', 'format-list-bulleted')}
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name='add-transaction'>
				<Label>Add Transaction</Label>
				{renderTabIcon('plus.circle.fill', 'plus-circle-outline')}
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name='assistant'>
				<Label>Assistant</Label>
				{renderTabIcon('plus.circle.fill', 'robot')}
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name='profile'>
				<Label>Profile</Label>
				{renderTabIcon('gear', 'account-circle-outline')}
			</NativeTabs.Trigger>
		</NativeTabs>
	)
}
export default TabLayout
