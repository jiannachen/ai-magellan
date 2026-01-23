'use client'

import { useUser } from '@clerk/nextjs'
import useSWR from 'swr'

interface AdminStatusResponse {
  isAdmin: boolean
}

const fetcher = (url: string): Promise<AdminStatusResponse> =>
  fetch(url).then(res => res.json())

export function useIsAdmin() {
  const { isSignedIn, isLoaded } = useUser()

  const { data, isLoading, error } = useSWR<AdminStatusResponse>(
    isLoaded && isSignedIn ? '/api/user/admin-status' : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 缓存 1 分钟
    }
  )

  return {
    isAdmin: data?.isAdmin ?? false,
    isLoading: !isLoaded || isLoading,
    error,
  }
}
