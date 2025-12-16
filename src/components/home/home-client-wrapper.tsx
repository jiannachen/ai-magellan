"use client";

import { useEffect } from "react";
import { useAtom } from "jotai";
import { websitesAtom, categoriesAtom } from "@/lib/atoms";
import type { Website, Category } from "@/lib/types";

interface HomeClientWrapperProps {
  initialWebsites: Website[];
  initialCategories: Category[];
  children: React.ReactNode;
}

/**
 * Home Client Wrapper - Client Component
 * 仅负责初始化全局状态,将所有UI移到服务端组件
 */
export default function HomeClientWrapper({
  initialWebsites,
  initialCategories,
  children,
}: HomeClientWrapperProps) {
  const [, setWebsites] = useAtom(websitesAtom);
  const [, setCategories] = useAtom(categoriesAtom);

  // 初始化全局状态
  useEffect(() => {
    setWebsites(initialWebsites);
    setCategories(initialCategories);
  }, [initialWebsites, initialCategories, setWebsites, setCategories]);

  return <>{children}</>;
}
