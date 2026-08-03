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
		<SafeAreaView>
			<FlatList
				data={persons}
				keyExtractor={(person) => person.id.toString()}
				contentContainerStyle={{ padding: 16 }}
				renderItem={({ item }) => (
					<View
						style={{
							backgroundColor: '#f9f9f9',
							padding: 12,
							borderRadius: 10,
							marginBottom: 10,
						}}
					>
						<Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
						<Text style={{ color: '#666' }}>{item.age}</Text>
						<Text style={{ color: '#187cce' }}>{item.profession}</Text>
					</View>
				)}
			/>
		</SafeAreaView>
	)
}
