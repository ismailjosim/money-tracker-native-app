import { useAuth } from '@clerk/expo'
import { useMemo } from 'react'
import { createClerkSupabaseClient } from '@/lib/schemas/supabase'

const useSupabase = () => {
  const { getToken } = useAuth()
  const client = useMemo(() => createClerkSupabaseClient(() => getToken()), [])
  return client
}

export default useSupabase
