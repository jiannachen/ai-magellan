# Atlassian Design System Specification
## 基于Atlassian产品设计理念的UI设计规范文档

### 📖 目录
1. [核心设计理念](#核心设计理念)
2. [视觉设计系统](#视觉设计系统)
3. [交互设计原则](#交互设计原则)
4. [组件设计规范](#组件设计规范)
5. [布局与间距](#布局与间距)
6. [实施指南](#实施指南)

---

## 🎯 核心设计理念

### Atlassian设计哲学

#### 1. **Bold, Optimistic, and Practical (大胆、乐观、实用)**
- **定义**: 设计应该既具有视觉冲击力，又传达积极态度，同时保持实用性
- **执行标准**:
  - 使用鲜明但不刺眼的颜色
  - 营造友好、专业的氛围
  - 每个设计决策都要服务于用户目标
  - 避免过度装饰，专注功能性

#### 2. **Team-first Design (团队优先设计)**
- **定义**: 设计需要促进协作，支持团队工作流程
- **执行标准**:
  - 清晰的信息层级
  - 支持多用户协作的界面元素
  - 状态可视化和实时反馈
  - 减少认知负担，提高团队效率

#### 3. **Inclusive and Accessible (包容性和可访问性)**
- **定义**: 设计应该为所有用户提供无障碍体验
- **执行标准**:
  - WCAG 2.1 AA标准合规
  - 颜色对比度至少4.5:1
  - 键盘导航支持
  - 屏幕阅读器兼容性

#### 4. **Systematic and Scalable (系统化和可扩展)**
- **定义**: 建立一致的设计语言，支持产品生态扩展
- **执行标准**:
  - 统一的设计令牌系统
  - 可复用的组件库
  - 一致的交互模式
  - 模块化设计架构

---

## 🎨 视觉设计系统

### 颜色系统 (Color System)

#### **品牌主色调**
```css
/* Atlassian Blue Family */
:root {
  --atlassian-blue-50: #E9F2FF;
  --atlassian-blue-100: #CCE0FF;
  --atlassian-blue-200: #85B8FF;
  --atlassian-blue-300: #4A90E2;
  --atlassian-blue-400: #2684FF;  /* Primary Blue */
  --atlassian-blue-500: #0065FF;
  --atlassian-blue-600: #0052CC;
  --atlassian-blue-700: #0043A3;
  --atlassian-blue-800: #003080;
  --atlassian-blue-900: #002159;

  /* Primary Brand Color */
  --color-primary: var(--atlassian-blue-400);
  --color-primary-hover: var(--atlassian-blue-500);
  --color-primary-active: var(--atlassian-blue-600);
}
```

#### **功能性色彩**
```css
/* Success - Green */
:root {
  --color-success-50: #E8F5E8;
  --color-success-100: #D3F1D8;
  --color-success-200: #9DD9AF;
  --color-success-300: #6EC071;
  --color-success-400: #4BCE47;  /* Success Green */
  --color-success-500: #36B37E;
  --color-success-600: #2B9D5F;
  --color-success-700: #22804F;
  --color-success-800: #1A633F;
  --color-success-900: #13472F;

  /* Warning - Yellow */
  --color-warning-50: #FFF7E6;
  --color-warning-100: #FFECB3;
  --color-warning-200: #FFD666;
  --color-warning-300: #FFC400;  /* Warning Yellow */
  --color-warning-400: #FFAB00;
  --color-warning-500: #FF991F;
  --color-warning-600: #FF8B00;
  --color-warning-700: #FF7A00;
  --color-warning-800: #E65A00;
  --color-warning-900: #BF4A00;

  /* Error - Red */
  --color-error-50: #FFE9E6;
  --color-error-100: #FFBDBA;
  --color-error-200: #FF8F82;
  --color-error-300: #FF5630;  /* Error Red */
  --color-error-400: #DE350B;
  --color-error-500: #C42914;
  --color-error-600: #AE1F0C;
  --color-error-700: #981611;
  --color-error-800: #7A0E0A;
  --color-error-900: #5D0F08;
}
```

#### **中性色彩**
```css
/* Neutral Colors */
:root {
  /* Light Mode */
  --color-neutral-0: #FFFFFF;
  --color-neutral-50: #FAFBFC;
  --color-neutral-100: #F4F5F7;
  --color-neutral-200: #EBECF0;
  --color-neutral-300: #DFE1E6;
  --color-neutral-400: #C1C7D0;
  --color-neutral-500: #8993A4;  /* Body Text */
  --color-neutral-600: #6B778C;
  --color-neutral-700: #5E6C84;
  --color-neutral-800: #42526E;  /* Heading Text */
  --color-neutral-900: #172B4D;  /* Dark Text */
  --color-neutral-1000: #091E42; /* Darkest */
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  :root {
    --color-neutral-0: #0D1117;
    --color-neutral-50: #161B22;
    --color-neutral-100: #21262D;
    --color-neutral-200: #30363D;
    --color-neutral-300: #484F58;
    --color-neutral-400: #6E7681;
    --color-neutral-500: #8B949E;
    --color-neutral-600: #B1BAC4;
    --color-neutral-700: #C9D1D9;
    --color-neutral-800: #F0F6FC;
    --color-neutral-900: #F0F6FC;
    --color-neutral-1000: #FFFFFF;
  }
}
```

### 字体系统 (Typography)

#### **字体家族**
```css
/* Atlassian Typography */
:root {
  --font-family-sans: 'Charlie Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  --font-family-mono: 'SFMono-Medium', 'SF Mono', 'Consolas', 'Roboto Mono', 'Monaco', 'Courier New', monospace;
}
```

#### **字体层级**
```css
/* Typography Scale */
.text-display {
  font-size: 48px;
  font-weight: 500;
  line-height: 56px;
  letter-spacing: -0.02em;
}

.text-h1 {
  font-size: 40px;
  font-weight: 500;
  line-height: 48px;
  letter-spacing: -0.02em;
}

.text-h2 {
  font-size: 32px;
  font-weight: 500;
  line-height: 40px;
  letter-spacing: -0.01em;
}

.text-h3 {
  font-size: 24px;
  font-weight: 500;
  line-height: 32px;
  letter-spacing: -0.01em;
}

.text-h4 {
  font-size: 20px;
  font-weight: 500;
  line-height: 28px;
  letter-spacing: -0.01em;
}

.text-h5 {
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  letter-spacing: 0;
}

.text-h6 {
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  letter-spacing: 0;
  text-transform: uppercase;
}

.text-body-large {
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  letter-spacing: 0;
}

.text-body {
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  letter-spacing: 0;
}

.text-body-small {
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  letter-spacing: 0;
}

.text-caption {
  font-size: 11px;
  font-weight: 400;
  line-height: 16px;
  letter-spacing: 0.5px;
}
```

### 间距系统 (Spacing)

#### **基于8px网格的间距系统**
```css
/* Spacing Scale */
:root {
  --space-0: 0;
  --space-2: 2px;    /* 0.25 * 8px */
  --space-4: 4px;    /* 0.5 * 8px */
  --space-8: 8px;    /* 1 * 8px */
  --space-12: 12px;  /* 1.5 * 8px */
  --space-16: 16px;  /* 2 * 8px */
  --space-20: 20px;  /* 2.5 * 8px */
  --space-24: 24px;  /* 3 * 8px */
  --space-32: 32px;  /* 4 * 8px */
  --space-40: 40px;  /* 5 * 8px */
  --space-48: 48px;  /* 6 * 8px */
  --space-56: 56px;  /* 7 * 8px */
  --space-64: 64px;  /* 8 * 8px */
  --space-80: 80px;  /* 10 * 8px */
  --space-96: 96px;  /* 12 * 8px */
  --space-128: 128px; /* 16 * 8px */
}
```

### 阴影系统 (Elevation)

```css
/* Atlassian Shadow System */
.elevation-100 {
  box-shadow: 0 1px 1px rgba(9, 30, 66, 0.25);
}

.elevation-200 {
  box-shadow: 0 2px 4px rgba(9, 30, 66, 0.25);
}

.elevation-300 {
  box-shadow: 0 4px 8px rgba(9, 30, 66, 0.25);
}

.elevation-400 {
  box-shadow: 0 8px 16px rgba(9, 30, 66, 0.25);
}

.elevation-500 {
  box-shadow: 0 12px 24px rgba(9, 30, 66, 0.25);
}

.elevation-600 {
  box-shadow: 0 20px 32px rgba(9, 30, 66, 0.25);
}
```

### 圆角系统 (Border Radius)

```css
/* Border Radius */
:root {
  --radius-2: 2px;
  --radius-4: 4px;   /* Small elements */
  --radius-8: 8px;   /* Medium elements */
  --radius-12: 12px; /* Large elements */
  --radius-16: 16px; /* Extra large */
  --radius-full: 50%; /* Circular */
}
```

---

## 🖱️ 交互设计原则

### 触摸目标和可访问性

#### **最小触摸区域**
- **桌面端**: 24px × 24px (最小值)
- **移动端**: 44px × 44px (最小值)
- **推荐尺寸**: 48px × 48px

#### **间距要求**
- 相邻可交互元素间距 ≥ 8px
- 主要操作与次要操作间距 ≥ 16px

### 动画和过渡

#### **Atlassian缓动曲线**
```css
/* Easing Functions */
.transition-entrance {
  transition-timing-function: cubic-bezier(0.15, 1, 0.3, 1);
}

.transition-exit {
  transition-timing-function: cubic-bezier(0.6, 0, 0.85, 0.15);
}

.transition-standard {
  transition-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1);
}

.transition-decelerate {
  transition-timing-function: cubic-bezier(0, 0, 0.3, 1);
}
```

#### **动画时长**
- **微交互**: 100-150ms
- **页面元素**: 200-300ms
- **页面切换**: 300-500ms
- **复杂动画**: 500-800ms

### 状态设计

#### **交互状态**
```css
/* Interactive States */
.interactive {
  transition: all 200ms cubic-bezier(0.25, 0.1, 0.25, 1);
}

.interactive:hover {
  transform: translateY(-1px);
  box-shadow: var(--elevation-200);
}

.interactive:active {
  transform: translateY(0);
  box-shadow: var(--elevation-100);
}

.interactive:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.interactive:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
```

---

## 🧩 组件设计规范

### 按钮 (Buttons)

#### **主要按钮**
```css
.btn-primary {
  background: var(--color-primary);
  color: var(--color-neutral-0);
  border: none;
  border-radius: var(--radius-4);
  padding: var(--space-8) var(--space-16);
  font-size: 14px;
  font-weight: 500;
  min-height: 40px;
  cursor: pointer;
  transition: all 200ms cubic-bezier(0.25, 0.1, 0.25, 1);
}

.btn-primary:hover {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: var(--elevation-200);
}

.btn-primary:active {
  background: var(--color-primary-active);
  transform: translateY(0);
}
```

#### **次要按钮**
```css
.btn-secondary {
  background: var(--color-neutral-0);
  color: var(--color-neutral-800);
  border: 1px solid var(--color-neutral-300);
  border-radius: var(--radius-4);
  padding: var(--space-8) var(--space-16);
  font-size: 14px;
  font-weight: 500;
  min-height: 40px;
}

.btn-secondary:hover {
  background: var(--color-neutral-100);
  border-color: var(--color-neutral-400);
}
```

#### **危险操作按钮**
```css
.btn-danger {
  background: var(--color-error-300);
  color: var(--color-neutral-0);
  border: none;
  border-radius: var(--radius-4);
  padding: var(--space-8) var(--space-16);
}

.btn-danger:hover {
  background: var(--color-error-400);
}
```

### 表单控件

#### **输入框**
```css
.input-field {
  background: var(--color-neutral-0);
  border: 2px solid var(--color-neutral-300);
  border-radius: var(--radius-4);
  padding: var(--space-8) var(--space-12);
  font-size: 14px;
  line-height: 20px;
  min-height: 40px;
  transition: border-color 200ms cubic-bezier(0.25, 0.1, 0.25, 1);
}

.input-field:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 1px var(--color-primary);
}

.input-field:error {
  border-color: var(--color-error-300);
}

.input-field:disabled {
  background: var(--color-neutral-100);
  color: var(--color-neutral-500);
  cursor: not-allowed;
}
```

#### **选择器**
```css
.select-field {
  position: relative;
  background: var(--color-neutral-0);
  border: 2px solid var(--color-neutral-300);
  border-radius: var(--radius-4);
  padding: var(--space-8) var(--space-32) var(--space-8) var(--space-12);
  font-size: 14px;
  min-height: 40px;
  cursor: pointer;
}

.select-field::after {
  content: '';
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 4px solid var(--color-neutral-600);
}
```

### 卡片和容器

#### **卡片组件**
```css
.card {
  background: var(--color-neutral-0);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-8);
  padding: var(--space-24);
  box-shadow: var(--elevation-100);
  transition: all 200ms cubic-bezier(0.25, 0.1, 0.25, 1);
}

.card:hover {
  box-shadow: var(--elevation-300);
  transform: translateY(-2px);
}

.card-header {
  margin-bottom: var(--space-16);
  padding-bottom: var(--space-16);
  border-bottom: 1px solid var(--color-neutral-200);
}

.card-title {
  font-size: 20px;
  font-weight: 500;
  color: var(--color-neutral-900);
  margin: 0;
}

.card-content {
  color: var(--color-neutral-800);
  line-height: 1.5;
}
```

### 导航组件

#### **顶部导航栏**
```css
.navbar {
  background: var(--color-neutral-0);
  border-bottom: 1px solid var(--color-neutral-200);
  padding: var(--space-12) var(--space-24);
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 64px;
}

.navbar-brand {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-primary);
  text-decoration: none;
}

.navbar-nav {
  display: flex;
  align-items: center;
  gap: var(--space-24);
}

.navbar-item {
  padding: var(--space-8) var(--space-12);
  border-radius: var(--radius-4);
  color: var(--color-neutral-700);
  text-decoration: none;
  transition: all 200ms cubic-bezier(0.25, 0.1, 0.25, 1);
}

.navbar-item:hover {
  background: var(--color-neutral-100);
  color: var(--color-neutral-900);
}

.navbar-item.active {
  background: var(--color-primary);
  color: var(--color-neutral-0);
}
```

#### **侧边栏导航**
```css
.sidebar {
  background: var(--color-neutral-50);
  border-right: 1px solid var(--color-neutral-200);
  padding: var(--space-24);
  width: 240px;
  min-height: 100vh;
}

.sidebar-section {
  margin-bottom: var(--space-32);
}

.sidebar-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-neutral-600);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: var(--space-12);
}

.sidebar-item {
  display: flex;
  align-items: center;
  padding: var(--space-8) var(--space-12);
  border-radius: var(--radius-4);
  color: var(--color-neutral-700);
  text-decoration: none;
  margin-bottom: var(--space-4);
  transition: all 200ms cubic-bezier(0.25, 0.1, 0.25, 1);
}

.sidebar-item:hover {
  background: var(--color-neutral-200);
  color: var(--color-neutral-900);
}

.sidebar-item.active {
  background: var(--color-primary);
  color: var(--color-neutral-0);
}
```

---

## 📐 布局与间距

### 网格系统

#### **12列网格系统**
```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-24);
}

.row {
  display: flex;
  flex-wrap: wrap;
  margin: 0 calc(var(--space-12) * -1);
}

.col {
  flex: 1;
  padding: 0 var(--space-12);
}

/* Responsive columns */
.col-1 { width: 8.333333%; }
.col-2 { width: 16.666667%; }
.col-3 { width: 25%; }
.col-4 { width: 33.333333%; }
.col-6 { width: 50%; }
.col-8 { width: 66.666667%; }
.col-9 { width: 75%; }
.col-12 { width: 100%; }
```

### 页面布局

#### **标准页面布局**
```css
.page-layout {
  display: flex;
  min-height: 100vh;
}

.page-sidebar {
  width: 240px;
  flex-shrink: 0;
}

.page-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.page-header {
  padding: var(--space-24);
  border-bottom: 1px solid var(--color-neutral-200);
}

.page-content {
  flex: 1;
  padding: var(--space-32) var(--space-24);
}

.page-footer {
  padding: var(--space-24);
  border-top: 1px solid var(--color-neutral-200);
  background: var(--color-neutral-50);
}
```

### 响应式设计

#### **断点系统**
```css
/* Breakpoints */
:root {
  --screen-xs: 480px;
  --screen-sm: 768px;
  --screen-md: 1024px;
  --screen-lg: 1200px;
  --screen-xl: 1440px;
}

/* Mobile First Approach */
@media (min-width: 768px) {
  .container {
    padding: 0 var(--space-32);
  }
}

@media (min-width: 1024px) {
  .container {
    padding: 0 var(--space-48);
  }
}
```

---

## 🚀 实施指南

### 设计令牌系统

#### **创建设计令牌文件**
```json
{
  "color": {
    "brand": {
      "primary": {
        "value": "#2684FF",
        "type": "color"
      }
    },
    "neutral": {
      "100": {
        "value": "#F4F5F7",
        "type": "color"
      }
    }
  },
  "spacing": {
    "xs": {
      "value": "4px",
      "type": "spacing"
    },
    "sm": {
      "value": "8px",
      "type": "spacing"
    }
  },
  "typography": {
    "heading": {
      "h1": {
        "value": {
          "fontFamily": "Charlie Text",
          "fontSize": "40px",
          "fontWeight": "500",
          "lineHeight": "48px"
        },
        "type": "typography"
      }
    }
  }
}
```

### 组件库结构

```
atlassian-design-system/
├── tokens/
│   ├── colors.json
│   ├── typography.json
│   ├── spacing.json
│   └── shadows.json
├── components/
│   ├── Button/
│   ├── Input/
│   ├── Card/
│   ├── Navigation/
│   └── Modal/
├── patterns/
│   ├── forms/
│   ├── data-tables/
│   └── page-layouts/
└── utilities/
    ├── spacing.css
    ├── typography.css
    └── colors.css
```

### 质量检查清单

#### **设计检查**
- [ ] 所有触摸目标 ≥ 44px × 44px (移动端)
- [ ] 颜色对比度 ≥ 4.5:1 (WCAG AA)
- [ ] 使用统一的间距系统 (8px网格)
- [ ] 遵循Atlassian品牌色彩规范
- [ ] 支持暗色主题
- [ ] 动画时长合理 (≤ 500ms)
- [ ] 提供清晰的状态反馈

#### **开发检查**
- [ ] 使用语义化HTML
- [ ] 支持键盘导航
- [ ] 实现ARIA标签
- [ ] 响应式设计
- [ ] 性能优化
- [ ] 跨浏览器兼容性

### 工具推荐

#### **设计工具**
- **Figma**: 使用Atlassian Design System Kit
- **Sketch**: Atlassian组件库
- **Adobe XD**: Atlassian UI Kit

#### **开发工具**
- **Atlaskit**: 官方React组件库
- **Design Tokens**: Style Dictionary
- **CSS-in-JS**: Emotion (Atlassian推荐)

---

## 📚 参考资源

### 官方文档
- [Atlassian Design System](https://atlassian.design/)
- [Atlaskit Components](https://atlaskit.atlassian.com/)
- [Design Guidelines](https://atlassian.design/guidelines)

### 品牌资源
- [Brand Guidelines](https://atlassian.design/brand)
- [Logo Usage](https://atlassian.design/brand/logos)
- [Color Palette](https://atlassian.design/foundations/color)

### 最佳实践
- [Accessibility Guidelines](https://atlassian.design/guidelines/product/accessibility)
- [Writing Guidelines](https://atlassian.design/content)
- [Motion Guidelines](https://atlassian.design/guidelines/product/motion)

---

**文档版本**: 1.0  
**最后更新**: 2024年10月  
**维护者**: 设计团队

> 💡 **提示**: 本规范基于Atlassian最新的设计系统制定，建议定期查看官方更新并相应调整设计规范。本文档强调实用性、团队协作和可访问性，体现了Atlassian"团队优先"的设计哲学。