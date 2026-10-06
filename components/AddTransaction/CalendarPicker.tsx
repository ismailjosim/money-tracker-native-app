import React from 'react'
import DateTimePicker, { useDefaultStyles } from 'react-native-ui-datepicker'
import { useAppTheme } from '@/hooks/useAppTheme'

export function CalendarPicker({
  value,
  onChange,
  maximumDate,
}: {
  value: Date
  onChange: (date: Date) => void
  maximumDate?: Date
}) {
  const { theme } = useAppTheme()
  const defaultStyles = useDefaultStyles(theme === 'dark' ? 'dark' : 'light')

  return (
    <DateTimePicker
      mode="single"
      date={value}
      maxDate={maximumDate}
      onChange={({ date }) => date && onChange(new Date(date as string | number | Date))}
      styles={{
        ...defaultStyles,
        today: { borderWidth: 1, borderColor: '#00E599' },
        selected: { backgroundColor: '#00E599' },
        // selected_text: { color: '#08090D', fontWeight: 'bold' },
      }}
    />
  )
}
