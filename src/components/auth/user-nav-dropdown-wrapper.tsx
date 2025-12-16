"use client"

import { ReactNode } from "react"
import { DropdownMenuContent } from "@/ui/common/dropdown-menu"

interface UserNavDropdownWrapperProps {
  children: ReactNode
  className?: string
}

/**
 * 用户头像下拉菜单包装组件
 * 优化定位和对齐，确保在不同屏幕尺寸下都能正确显示
 */
export function UserNavDropdownWrapper({
  children,
  className = ''
}: UserNavDropdownWrapperProps) {
  return (
    <DropdownMenuContent
      className={className}
      align="end"
      alignOffset={0}
      sideOffset={8}
      side="bottom"
      avoidCollisions={true}
      collisionPadding={16}
      onCloseAutoFocus={(e) => {
        // 防止关闭时焦点跳转
        e.preventDefault()
      }}
    >
      {children}
    </DropdownMenuContent>
  )
}
