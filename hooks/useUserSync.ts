import { useUserStore } from '@/store/useStore'
import { useUser } from '@clerk/expo'
import useSupabase from './useSupabase'
import { useEffect } from 'react'

export const useUserSync = () => {
  const { user } = useUser()
  const setCurrency = useUserStore(state => state.setCurrency)
  const setNeedOnboarding = useUserStore(state => state.setNeedOnboarding)
  const authSupabase = useSupabase()

  useEffect(() => {
    if (!user || !authSupabase) return

    const syncUser = async () => {
      try {
        const { data: existingUser, error: fetchError } = await authSupabase
          .from('users')
          .select('clerk_id,currency')
          .eq('clerk_id', user.id)
          .single()

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Error fetching user:', fetchError)
          setNeedOnboarding(true)
          return
        }

        const email = user.emailAddresses[0].emailAddress
        const { data: newUser, error: insertError } = await authSupabase
          .from('users')
          .upsert(
            {
              clerk_id: user.id,
              email,
              name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
              image_url: user.imageUrl,
            },
            {
              onConflict: 'clerk_id',
              ignoreDuplicates: false,
            }
          )
          .select('currency')
          .single()

        if (insertError) {
          console.error('Error upserting user:', insertError)
          setNeedOnboarding(true)
          return
        }
        setCurrency(newUser?.currency ?? 'BDT')
        setNeedOnboarding(!newUser?.currency)

        if (!existingUser) {
          // create a default account for user
          const { error: accountError } = await authSupabase.from('accounts').insert({
            user_id: user.id,
            name: 'cash',
            type: 'CASH',
            balance: 0,
            is_default: true,
          })

          if (accountError) {
            console.error('Error creating account:', accountError)
            return
          }
        }
      } catch (err) {
        console.error('Failed to sync user:', err)
        setNeedOnboarding(true)
      }
    }

    syncUser()
  }, [user?.id])
}
