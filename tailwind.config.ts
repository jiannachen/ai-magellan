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

        // Apple标准色彩系统
        "color-blue": "hsl(var(--color-blue))",
        "color-green": "hsl(var(--color-green))",
        "color-red": "hsl(var(--color-red))",
        "color-orange": "hsl(var(--color-orange))",
        "color-yellow": "hsl(var(--color-yellow))",

        // Atlassian品牌色彩系统
        "atlassian-blue": {
          50: "#E9F2FF",
          100: "#CCE0FF", 
          200: "#85B8FF",
          300: "#4A90E2",
          400: "#2684FF", // Primary Blue
          500: "#0065FF",
          600: "#0052CC",
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

        // Apple标签色彩 (Label Colors)
        "label-primary": "hsl(var(--label-primary))",
        "label-secondary": "hsl(var(--label-secondary))",
        "label-tertiary": "hsl(var(--label-tertiary))",
        "label-quaternary": "hsl(var(--label-quaternary))",

        // Apple填充色彩 (Fill Colors)
        "fill-primary": "hsl(var(--fill-primary))",
        "fill-secondary": "hsl(var(--fill-secondary))",
        "fill-tertiary": "hsl(var(--fill-tertiary))",
        "fill-quaternary": "hsl(var(--fill-quaternary))",

        // Apple背景色彩 (Background Colors)
        "background-secondary": "hsl(var(--background-secondary))",
        "background-tertiary": "hsl(var(--background-tertiary))",

        // Apple分组背景 (Grouped Background)
        "grouped-background-primary": "hsl(var(--grouped-background-primary))",
        "grouped-background-secondary": "hsl(var(--grouped-background-secondary))",
        "grouped-background-tertiary": "hsl(var(--grouped-background-tertiary))",

        // Apple灰度系统
        "gray-1": "hsl(var(--gray-1))",
        "gray-2": "hsl(var(--gray-2))",
        "gray-3": "hsl(var(--gray-3))",
        "gray-4": "hsl(var(--gray-4))",
        "gray-5": "hsl(var(--gray-5))",
        "gray-6": "hsl(var(--gray-6))",

        // 保留原有颜色变量
        surface: "hsl(var(--surface))",
        "surface-variant": "hsl(var(--surface-variant))",
        hover: "hsl(var(--hover))",
        pressed: "hsl(var(--pressed))",
      },

      // 扩展圆角半径系统
      // 使用 CSS 变量实现一致的圆角样式
      borderRadius: {
        lg: "var(--radius)", // 大圆角
        md: "calc(var(--radius) - 2px)", // 中等圆角
        sm: "calc(var(--radius) - 4px)", // 小圆角
      },

      // 优化间距系统
      spacing: {
        '18': '4.5rem',   // 72px
        '22': '5.5rem',   // 88px
        '88': '22rem',    // 352px
      },

      // Apple字体系统
      fontSize: {
        // 保留原有字体大小
        '2xs': ['0.625rem', { lineHeight: '1rem' }], // 10px
        'xs': ['0.75rem', { lineHeight: '1.125rem' }], // 12px
        'sm': ['0.875rem', { lineHeight: '1.375rem' }], // 14px
        
        // Apple字体层级系统
        'largeTitle': ['34px', { lineHeight: '41px', letterSpacing: '0.374px' }],
        'title1': ['28px', { lineHeight: '34px', letterSpacing: '0.364px' }],
        'title2': ['22px', { lineHeight: '28px', letterSpacing: '0.352px' }],
        'title3': ['20px', { lineHeight: '25px', letterSpacing: '0.38px' }],
        'headline': ['17px', { lineHeight: '22px', letterSpacing: '-0.43px', fontWeight: '600' }],
        'body': ['17px', { lineHeight: '22px', letterSpacing: '-0.43px' }],
        'callout': ['16px', { lineHeight: '21px', letterSpacing: '-0.32px' }],
        'subhead': ['15px', { lineHeight: '20px', letterSpacing: '-0.24px' }],
        'footnote': ['13px', { lineHeight: '18px', letterSpacing: '-0.08px' }],
        'caption1': ['12px', { lineHeight: '16px', letterSpacing: '0px' }],
        'caption2': ['11px', { lineHeight: '13px', letterSpacing: '0.066px' }],

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

      // Apple阴影系统
      boxShadow: {
        // 保留原有阴影
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        
        // Apple标准阴影
        'apple-1': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'apple-2': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'apple-3': '0 4px 16px rgba(0, 0, 0, 0.1)',
        'apple-4': '0 8px 32px rgba(0, 0, 0, 0.1)',

        // Atlassian阴影系统 (Elevation)
        'atlassian-100': '0 1px 1px rgba(9, 30, 66, 0.25)',
        'atlassian-200': '0 2px 4px rgba(9, 30, 66, 0.25)', 
        'atlassian-300': '0 4px 8px rgba(9, 30, 66, 0.25)',
        'atlassian-400': '0 8px 16px rgba(9, 30, 66, 0.25)',
        'atlassian-500': '0 12px 24px rgba(9, 30, 66, 0.25)',
        'atlassian-600': '0 20px 32px rgba(9, 30, 66, 0.25)',
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
  plugins: [],
  darkMode: "class", // 使用 class 策略来控制暗色模式
} satisfies Config;
