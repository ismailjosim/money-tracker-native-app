import { FlatList, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

interface Person {
	id: number
	name: string
	age: number
	profession: string
}

const persons: Person[] = [
	{ id: 1, name: 'ismail', age: 28, profession: 'Programmer' },
	{ id: 2, name: 'yeasin', age: 26, profession: 'Instructor' },
	{ id: 3, name: 'awlad', age: 26, profession: 'Student' },
	{ id: 4, name: 'Jakia', age: 26, profession: 'Housewife' },
]

export default function Index() {
	return (
		<SafeAreaView className='flex-1 bg-zinc-50'>
			<FlatList
				data={persons}
				keyExtractor={(person) => person.id.toString()}
				contentContainerClassName='p-5 gap-4'
				renderItem={({ item }) => (
					<View className='rounded-3xl bg-white p-5 shadow-sm border border-zinc-100'>
						<View className='flex-row items-center'>
							{/* Avatar */}
							<View className='h-14 w-14 items-center justify-center rounded-full bg-blue-100'>
								<Text className='text-xl font-bold text-blue-700'>
									{item.name.charAt(0)}
								</Text>
							</View>

							{/* Content */}
							<View className='ml-4 flex-1'>
								<Text className='text-lg font-semibold text-zinc-900'>
									{item.name}
								</Text>

								<Text className='mt-1 text-zinc-500'>{item.age} years old</Text>

								<View className='mt-3 self-start rounded-full bg-blue-50 px-3 py-1'>
									<Text className='text-xs font-medium text-blue-700'>
										{item.profession}
									</Text>
								</View>
							</View>
						</View>
					</View>
				)}
			/>
		</SafeAreaView>
	)
}
