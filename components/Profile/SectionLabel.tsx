import { Text } from 'react-native'

function SectionLabel({ children }: { children: string }) {
  return (
    <Text className="mx-5 mb-2 mt-6 text-[11px] uppercase tracking-wide text-brand-text-muted">
      {children}
    </Text>
  )
}

export default SectionLabel
