import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1400px',
      },
    },
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        // 语义化颜色系统 - 使用CSS变量
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // 海洋主题颜色 - 直接映射到CSS变量
        'ocean-primary': 'hsl(var(--ocean-primary))',
        'ocean-primary-hover': 'hsl(var(--ocean-primary-hover))',
        'ocean-primary-light': 'hsl(var(--ocean-primary-light))',
        'ocean-success': 'hsl(var(--ocean-success))',
        'ocean-warning': 'hsl(var(--ocean-warning))',
        'ocean-accent': 'hsl(var(--ocean-accent))',
        'ocean-neutral': 'hsl(var(--ocean-neutral))',
      },

      // 统一圆角系统 - 8px标准
      borderRadius: {
        lg: "var(--radius)",        // 8px - 标准圆角
        md: "calc(var(--radius) - 2px)",  // 6px
        sm: "calc(var(--radius) - 4px)",  // 4px
      },

      // 统一间距系统 - 8px网格
      spacing: {
        'xs': 'var(--space-xs)',    // 4px
        'sm': 'var(--space-sm)',    // 8px
        'md': 'var(--space-md)',    // 12px
        'lg': 'var(--space-lg)',    // 16px
        'xl': 'var(--space-xl)',    // 24px
        '2xl': 'var(--space-2xl)',  // 32px
        '3xl': 'var(--space-3xl)',  // 48px
      },

      // 统一阴影系统
      boxShadow: {
        'ocean-sm': '0 1px 2px rgba(9, 30, 66, 0.08)',
        'ocean-md': '0 2px 4px rgba(9, 30, 66, 0.12)',
        'ocean-lg': '0 4px 8px rgba(9, 30, 66, 0.15)',
      },

      // 动画时长
      transitionDuration: {
        'fast': 'var(--duration-fast)',      // 150ms
        'normal': 'var(--duration-normal)',  // 200ms
        'slow': 'var(--duration-slow)',      // 300ms
      },

      // 动画曲线
      transitionTimingFunction: {
        'smooth': 'var(--ease-smooth)',
      },

      // 统一字体大小
      fontSize: {
        'xs': ['12px', { lineHeight: '1.5' }],
        'sm': ['14px', { lineHeight: '1.6' }],
        'base': ['16px', { lineHeight: '1.6' }],
        'lg': ['18px', { lineHeight: '1.5' }],
        'xl': ['20px', { lineHeight: '1.4' }],
        '2xl': ['24px', { lineHeight: '1.3' }],
        '3xl': ['32px', { lineHeight: '1.2' }],
      },
    },
  },
  plugins: [],
} satisfies Config;
