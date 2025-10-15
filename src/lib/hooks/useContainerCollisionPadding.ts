"use client";

import { useEffect, useState } from "react";

type Padding = number | { top?: number; right?: number; bottom?: number; left?: number };

export function useContainerCollisionPadding(defaultPadding: number = 8): Padding {
  const [padding, setPadding] = useState<Padding>(defaultPadding);

  useEffect(() => {
    const compute = () => {
      if (typeof window === "undefined") return;

      const container =
        (document.querySelector("header nav.container") as HTMLElement | null) ||
        (document.querySelector("nav.container") as HTMLElement | null) ||
        (document.querySelector(".container") as HTMLElement | null);

      if (!container) {
        setPadding(defaultPadding);
        return;
      }

      const rect = container.getBoundingClientRect();
      // 确保最小间距为 defaultPadding，并适当增加右侧边距以防止溢出
      const left = Math.max(Math.floor(rect.left), defaultPadding);
      const right = Math.max(Math.floor(window.innerWidth - rect.right), defaultPadding);

      // 为小屏幕设备增加额外的安全边距
      const safeLeft = window.innerWidth < 640 ? left + 4 : left;
      const safeRight = window.innerWidth < 640 ? right + 4 : right;

      setPadding({
        left: safeLeft,
        right: safeRight,
        top: defaultPadding,
        bottom: defaultPadding
      });
    };

    compute();

    // 使用 requestAnimationFrame 确保在 DOM 更新后计算
    const rafId = requestAnimationFrame(compute);

    window.addEventListener("resize", compute);
    window.addEventListener("scroll", compute);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", compute);
      window.removeEventListener("scroll", compute);
    };
  }, [defaultPadding]);

  return padding;
}

