import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // 扩展 Tailwind 的默认颜色系统
      // 使用 CSS 变量和 HSL 颜色格式实现动态主题
      colors: {
        // 基础界面颜色
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        // 主要强调色
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },

        // 次要强调色
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },

        // 破坏性操作颜色
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },

        // 柔和的界面元素颜色
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },

        // 强调色
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },

        // 弹出层颜色
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },

        // 卡片颜色
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },


        // Atlassian 2024 Design System Tokens
        "ds-background-brand-bold": "#0052CC",
        "ds-background-brand-bold-hovered": "#0747A6", 
        "ds-background-brand-bold-pressed": "#092E5C",
        "ds-background-neutral": "#FFFFFF",
        "ds-background-neutral-subtle": "#F7F8F9",
        "ds-background-neutral-subtle-hovered": "#F1F2F4",
        "ds-background-neutral-subtle-pressed": "#DCDFE4",
        "ds-text": "#172B4D",
        "ds-text-subtle": "#626F86",
        "ds-text-subtlest": "#758195",
        "ds-text-disabled": "#091E424F",
        "ds-link": "#0052CC",
        "ds-link-pressed": "#0747A6",
        "ds-background-success": "#1F845A",
        "ds-background-success-bold": "#22A06B",
        "ds-background-warning": "#974F0C",
        "ds-background-warning-bold": "#E56910",
        "ds-background-danger": "#C9372C",
        "ds-background-danger-bold": "#E34935",

        // Atlassian品牌色彩系统（保持向后兼容）
        "atlassian-blue": {
          50: "#E9F2FF",
          100: "#CCE0FF", 
          200: "#85B8FF",
          300: "#4A90E2",
          400: "#2684FF",
          500: "#0065FF",
          600: "#0052CC", // Atlassian Official Primary Blue
          700: "#0043A3",
          800: "#003080",
          900: "#002159",
        },
        "atlassian-green": {
          50: "#E8F5E8",
          100: "#D3F1D8",
          200: "#9DD9AF", 
          300: "#6EC071",
          400: "#4BCE47", // Success Green
          500: "#36B37E",
          600: "#2B9D5F",
          700: "#22804F",
          800: "#1A633F",
          900: "#13472F",
        },
        "atlassian-red": {
          50: "#FFE9E6",
          100: "#FFBDBA",
          200: "#FF8F82",
          300: "#FF5630", // Error Red
          400: "#DE350B",
          500: "#C42914",
          600: "#AE1F0C",
          700: "#981611",
          800: "#7A0E0A",
          900: "#5D0F08",
        },
        "atlassian-yellow": {
          50: "#FFF7E6",
          100: "#FFECB3",
          200: "#FFD666",
          300: "#FFC400", // Warning Yellow
          400: "#FFAB00",
          500: "#FF991F",
          600: "#FF8B00",
          700: "#FF7A00",
          800: "#E65A00",
          900: "#BF4A00",
        },
        "atlassian-neutral": {
          0: "#FFFFFF",
          50: "#FAFBFC",
          100: "#F4F5F7",
          200: "#EBECF0",
          300: "#DFE1E6",
          400: "#C1C7D0",
          500: "#8993A4", // Body Text
          600: "#6B778C",
          700: "#5E6C84",
          800: "#42526E", // Heading Text
          900: "#172B4D", // Dark Text
          1000: "#091E42", // Darkest
        },
      },

      // Atlassian Design System Spacing Tokens
      spacing: {
        // 原有间距
        '18': '4.5rem',   // 72px
        '22': '5.5rem',   // 88px
        '88': '22rem',    // 352px
        
        // Atlassian Design System Spacing
        'ds-space-025': '2px',
        'ds-space-050': '4px', 
        'ds-space-075': '6px',
        'ds-space-100': '8px',
        'ds-space-150': '12px',
        'ds-space-200': '16px',
        'ds-space-250': '20px',
        'ds-space-300': '24px',
        'ds-space-400': '32px',
        'ds-space-500': '40px',
        'ds-space-600': '48px',
        'ds-space-800': '64px',
        'ds-space-1000': '80px',
      },

      // Atlassian Border Radius Tokens
      borderRadius: {
        lg: "var(--radius)", // 大圆角
        md: "calc(var(--radius) - 2px)", // 中等圆角
        sm: "calc(var(--radius) - 4px)", // 小圆角
        
        // Atlassian Design System Border Radius
        'ds-050': '2px',
        'ds-100': '4px',
        'ds-200': '8px', 
        'ds-300': '12px',
        'ds-400': '16px',
        'ds-round': '50%',
      },

      // Atlassian Motion Tokens
      transitionDuration: {
        'ds-instant': '0ms',
        'ds-fast': '100ms',
        'ds-medium': '200ms', 
        'ds-slow': '300ms',
        'ds-slower': '500ms',
      },

      transitionTimingFunction: {
        'ds-entrance': 'cubic-bezier(0.15, 1, 0.3, 1)',
        'ds-exit': 'cubic-bezier(0.6, 0, 0.85, 0.15)',
        'ds-standard': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        'ds-decelerate': 'cubic-bezier(0, 0, 0.3, 1)',
        'ds-accelerate': 'cubic-bezier(0.7, 0, 1, 0.5)',
      },

      // Apple字体系统
      fontSize: {
        // 保留原有字体大小
        '2xs': ['0.625rem', { lineHeight: '1rem' }], // 10px
        'xs': ['0.75rem', { lineHeight: '1.125rem' }], // 12px
        'sm': ['0.875rem', { lineHeight: '1.375rem' }], // 14px
        

        // Atlassian字体层级系统
        'atlassian-display': ['48px', { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '500' }],
        'atlassian-h1': ['40px', { lineHeight: '48px', letterSpacing: '-0.02em', fontWeight: '500' }],
        'atlassian-h2': ['32px', { lineHeight: '40px', letterSpacing: '-0.01em', fontWeight: '500' }],
        'atlassian-h3': ['24px', { lineHeight: '32px', letterSpacing: '-0.01em', fontWeight: '500' }],
        'atlassian-h4': ['20px', { lineHeight: '28px', letterSpacing: '-0.01em', fontWeight: '500' }],
        'atlassian-h5': ['16px', { lineHeight: '24px', letterSpacing: '0', fontWeight: '600' }],
        'atlassian-h6': ['14px', { lineHeight: '20px', letterSpacing: '0', fontWeight: '600' }],
        'atlassian-body-large': ['16px', { lineHeight: '24px', letterSpacing: '0' }],
        'atlassian-body': ['14px', { lineHeight: '20px', letterSpacing: '0' }],
        'atlassian-body-small': ['12px', { lineHeight: '16px', letterSpacing: '0' }],
        'atlassian-caption': ['11px', { lineHeight: '16px', letterSpacing: '0.5px' }],
      },

      // Atlassian阴影系统
      boxShadow: {
        // 保留原有阴影
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        
        // Atlassian阴影系统 (Elevation)
        'atlassian-100': '0 1px 1px rgba(9, 30, 66, 0.25)',
        'atlassian-200': '0 2px 4px rgba(9, 30, 66, 0.25)', 
        'atlassian-300': '0 4px 8px rgba(9, 30, 66, 0.25)',
        'atlassian-400': '0 8px 16px rgba(9, 30, 66, 0.25)',
        'atlassian-500': '0 12px 24px rgba(9, 30, 66, 0.25)',
        'atlassian-600': '0 20px 32px rgba(9, 30, 66, 0.25)',
        
        // Atlassian Design System Elevation Tokens
        'ds-raised': '0px 1px 1px rgba(9, 30, 66, 0.25), 0px 0px 1px rgba(9, 30, 66, 0.31)',
        'ds-overlay': '0px 4px 8px rgba(9, 30, 66, 0.25), 0px 0px 1px rgba(9, 30, 66, 0.31)',
        'ds-popup': '0px 8px 12px rgba(9, 30, 66, 0.15), 0px 0px 1px rgba(9, 30, 66, 0.31)',
        'ds-modal': '0px 20px 32px rgba(9, 30, 66, 0.15), 0px 0px 1px rgba(9, 30, 66, 0.31)',
      },
    },
    // 自定义断点，优化移动端体验
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    // 自定义容器配置
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
  },
  plugins: [
    // Atlassian Design System Plugin for Reduced Motion
    function({ addUtilities, theme, addBase }: any) {
      addBase({
        '@media (prefers-reduced-motion: reduce)': {
          '*, *::before, *::after': {
            'animation-duration': '0.01ms !important',
            'animation-iteration-count': '1 !important',
            'transition-duration': '0.01ms !important',
            'scroll-behavior': 'auto !important',
          },
        },
      });
      
      addUtilities({
        '.ds-motion-safe': {
          '@media (prefers-reduced-motion: no-preference)': {
            'transition-duration': theme('transitionDuration.ds-medium'),
            'transition-timing-function': theme('transitionTimingFunction.ds-standard'),
          },
        },
        '.ds-motion-reduce': {
          '@media (prefers-reduced-motion: reduce)': {
            'transition-duration': '0.01ms',
            'animation-duration': '0.01ms',
          },
        },
      });
    }
  ],
  darkMode: "class", // 使用 class 策略来控制暗色模式
} satisfies Config;
