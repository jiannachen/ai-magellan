"use client"

import { ReactNode, useEffect, useMemo, useState } from "react"
import { DropdownMenuContent } from "@/ui/common/dropdown-menu"
import { useContainerCollisionPadding } from "@/lib/hooks/useContainerCollisionPadding"

interface UserNavDropdownWrapperProps {
  children: ReactNode
  className?: string
}

/**
 * 专门为用户头像下拉菜单设计的包装组件
 * 解决下拉菜单溢出版心的问题
 * 复用统一的 useContainerCollisionPadding hook
 */
export function UserNavDropdownWrapper({
  children,
  className = ''
}: UserNavDropdownWrapperProps) {
  // 使用统一的边距计算 hook,默认 16px 边距
  const collisionPadding = useContainerCollisionPadding(16)
  const [boundaryEl, setBoundaryEl] = useState<HTMLElement | null>(null)

  // 捕获 header/container 作为碰撞边界，限制在版心内
  useEffect(() => {
    if (typeof window === 'undefined') return
    const el =
      (document.querySelector('header nav.container') as HTMLElement | null) ||
      (document.querySelector('nav.container') as HTMLElement | null) ||
      (document.querySelector('.container') as HTMLElement | null)
    setBoundaryEl(el)
  }, [])

  // 同时加入 body 作为额外边界，确保不出视口
  const collisionBoundary = useMemo(() => {
    if (typeof window === 'undefined') return undefined
    const list: Element[] = []
    if (boundaryEl) list.push(boundaryEl)
    if (document.body) list.push(document.body)
    return list.length ? list : undefined
  }, [boundaryEl])

  return (
    <DropdownMenuContent
      className={className}
      align="end"
      alignOffset={-4}
      sideOffset={8}
      avoidCollisions={true}
      collisionPadding={collisionPadding}
      collisionBoundary={collisionBoundary}
      side="bottom"
      sticky="always"
      onCloseAutoFocus={(e) => {
        // 防止关闭时焦点跳转
        e.preventDefault()
      }}
    >
      {children}
    </DropdownMenuContent>
  )
}
