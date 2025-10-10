'use client'

import { useUser, useClerk } from '@clerk/nextjs'
import { Button } from '@/ui/common/button'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/ui/common/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/common/avatar'
import { LogIn, LogOut, User, Settings } from 'lucide-react'
import Link from 'next/link'

export function UserNav() {
  const { isLoaded, isSignedIn, user } = useUser()
  const { signOut } = useClerk()

  if (!isLoaded) {
    return (
      <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
    )
  }

  if (!isSignedIn) {
    return (
      <Link href="/auth/signin">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <LogIn className="h-4 w-4" />
          登录
        </Button>
      </Link>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.imageUrl || ''} alt={user?.fullName || ''} />
            <AvatarFallback>
              {user?.firstName?.charAt(0) || user?.emailAddresses?.[0]?.emailAddress?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {user?.fullName && (
              <p className="font-medium">{user.fullName}</p>
            )}
            {user?.emailAddresses?.[0]?.emailAddress && (
              <p className="w-[200px] truncate text-sm text-muted-foreground">
                {user.emailAddresses[0].emailAddress}
              </p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profile/info" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            <span>个人信息</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={(event) => {
            event.preventDefault()
            signOut()
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>退出登录</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}