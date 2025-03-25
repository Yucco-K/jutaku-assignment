'use client'

import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import { useEffect } from 'react'
import { supabase } from '~/lib/supabase/browser'

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        window.location.reload()
      }
      if (event === 'SIGNED_OUT') {
        window.location.reload()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <MantineProvider>
      {children}
      <Notifications position="bottom-right" zIndex={5000} autoClose={3000} />
    </MantineProvider>
  )
}
