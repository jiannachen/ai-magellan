'use client'

import { useSession, signOut as nextAuthSignOut } from 'next-auth/react'

/**
 * Compatibility hook to replace Clerk's useUser/useClerk.
 * Provides the same interface to minimize component changes.
 */
export function useAuth() {
  const { data: session, status } = useSession()

  const isLoaded = status !== 'loading'
  const isSignedIn = status === 'authenticated'

  const user = session?.user
    ? {
        id: session.user.id,
        fullName: session.user.name,
        firstName: session.user.name?.split(' ')[0] || null,
        imageUrl: session.user.image || '',
        emailAddresses: session.user.email
          ? [{ emailAddress: session.user.email, verification: { status: 'verified' as const } }]
          : [],
        createdAt: null as Date | null,
      }
    : null

  const handleSignOut = (callback?: () => void) => {
    nextAuthSignOut({ redirect: false }).then(() => {
      callback?.()
    })
  }

  return { isLoaded, isSignedIn, user, signOut: handleSignOut }
}
