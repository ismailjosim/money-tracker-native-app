import React from 'react'
import { Text } from 'react-native'

export default function SectionLabel({ children }: { children: string }) {
  return (
    <Text className="mx-5 mb-2 mt-5 text-[11px] font-bold uppercase tracking-widest text-slate-400">
      {children}
    </Text>
  )
}
