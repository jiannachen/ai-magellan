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
      const left = Math.max(Math.floor(rect.left), defaultPadding);
      const right = Math.max(Math.floor(window.innerWidth - rect.right), defaultPadding);

      setPadding({ left, right, top: defaultPadding, bottom: defaultPadding });
    };

    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [defaultPadding]);

  return padding;
}

