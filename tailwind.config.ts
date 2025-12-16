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

        // 海洋主题颜色 - 映射到 Nebula 紫色主题
        'ocean-primary': 'hsl(var(--nebula-primary))',
        'ocean-primary-hover': 'hsl(var(--nebula-primary-hover))',
        'ocean-primary-light': 'hsl(var(--nebula-primary-light))',
        'ocean-success': 'hsl(var(--nebula-success))',
        'ocean-warning': 'hsl(var(--nebula-warning))',
        'ocean-accent': 'hsl(var(--nebula-cyan))',
        'ocean-neutral': 'hsl(var(--nebula-neutral))',

        // Magellan 主题颜色 - 映射到 Nebula 紫色主题
        'magellan-primary': 'hsl(var(--nebula-primary))',
        'magellan-teal': 'hsl(var(--nebula-cyan))',
        'magellan-coral': 'hsl(var(--nebula-secondary))',
        'magellan-gold': 'hsl(var(--nebula-warning))',
        'magellan-mint': 'hsl(var(--nebula-success))',
        'magellan-navy': 'hsl(var(--nebula-neutral))',
        'magellan-depth-50': 'hsl(var(--neutral-50))',
        'magellan-depth-600': 'hsl(var(--neutral-500))',
        'magellan-depth-700': 'hsl(270 30% 30%)',
        'magellan-depth-800': 'hsl(var(--neutral-800))',
        'magellan-depth-900': 'hsl(var(--neutral-900))',
      },

      // 统一圆角系统 - 现代SaaS风格
      borderRadius: {
        lg: "var(--radius-lg)",     // 12px - 大圆角
        DEFAULT: "var(--radius)",   // 8px - 标准圆角
        md: "var(--radius)",        // 8px
        sm: "var(--radius-sm)",     // 6px - 小圆角
      },

      // 统一间距系统 - 4px网格
      spacing: {
        '18': '4.5rem',   // 72px
        '22': '5.5rem',   // 88px
      },

      // 现代阴影系统
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      },

      // 动画配置
      transitionDuration: {
        DEFAULT: '200ms',
        'fast': '150ms',
        'slow': '300ms',
      },

      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
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
