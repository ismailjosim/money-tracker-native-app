import { Text, View } from 'react-native'

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'
  return (
    <View className={`mb-3 max-w-[85%] ${isUser ? 'self-end' : 'self-start'}`}>
      <View
        className={`rounded-2xl px-3.5 py-2.5 ${
          isUser ? 'bg-brand-bg' : 'border border-[#E8E6DF] bg-white'
        }`}
      >
        <Text className={`text-sm ${isUser ? 'text-white' : 'text-brand-bg'}`}>
          {message.content}
        </Text>
      </View>
    </View>
  )
}
export default MessageBubble
