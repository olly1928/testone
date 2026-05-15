import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

type SyncStatus = 'connecting' | 'connected' | 'error'

export function SyncIndicator() {
  const [status, setStatus] = useState<SyncStatus>('connecting')

  useEffect(() => {
    const channel = supabase
      .channel('sync-heartbeat')
      .subscribe((state: string) => {
        if (state === 'SUBSCRIBED') setStatus('connected')
        else if (state === 'CHANNEL_ERROR' || state === 'TIMED_OUT') setStatus('error')
        else setStatus('connecting')
      })

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [])

  const dotClass =
    status === 'connected'
      ? 'bg-green-500'
      : status === 'error'
        ? 'bg-red-500'
        : 'bg-amber-400 animate-pulse'

  const label =
    status === 'connected' ? 'Connected' : status === 'error' ? 'Offline' : 'Connecting…'

  const textClass =
    status === 'connected'
      ? 'text-green-600 dark:text-green-400'
      : status === 'error'
        ? 'text-red-600 dark:text-red-400'
        : 'text-amber-600 dark:text-amber-400'

  return (
    <div className="flex items-center gap-2 px-3 py-2">
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotClass}`} />
      <span className={`text-xs font-medium ${textClass}`}>{label}</span>
    </div>
  )
}
