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

```css
/* Design Tokens - Semantic Color System */
:root {
  /* Brand colors - 品牌色 */
  --ds-background-brand-bold: #0052CC;
  --ds-background-brand-bold-hovered: #0747A6;
  --ds-background-brand-bold-pressed: #092E5C;
  
  /* Neutral colors - 中性色 */
  --ds-background-neutral: #FFFFFF;
  --ds-background-neutral-subtle: #F7F8F9;
  --ds-background-neutral-subtle-hovered: #F1F2F4;
  --ds-background-neutral-subtle-pressed: #DCDFE4;
  
  /* Text colors - 文字颜色 */
  --ds-text: #172B4D;
  --ds-text-subtle: #626F86;
  --ds-text-subtlest: #758195;
  --ds-text-disabled: #091E424F;
  
  /* Interactive colors - 交互色 */
  --ds-link: #0052CC;
  --ds-link-pressed: #0747A6;
  
  /* Status colors - 状态色 */
  --ds-background-success: #1F845A;
  --ds-background-success-bold: #22A06B;
  --ds-background-warning: #974F0C;
  --ds-background-warning-bold: #E56910;
  --ds-background-danger: #C9372C;
  --ds-background-danger-bold: #E34935;
}

/* Dark mode tokens */
@media (prefers-color-scheme: dark) {
  :root {
    --ds-background-neutral: #1D2125;
    --ds-background-neutral-subtle: #22272B;
    --ds-text: #B6C2CF;
    --ds-text-subtle: #8C9BAB;
    /* ... 其他暗色模式值 */
  }
}
```

### 字体系统 (Typography)

#### **字体家族**
```css
/* Atlassian Typography - 2024 Updated */
:root {
  --ds-font-family-sans: 'Charlie Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  --ds-font-family-mono: 'SFMono-Medium', 'SF Mono', 'Consolas', 'Roboto Mono', 'Monaco', 'Courier New', monospace;
  
  /* Font weights */
  --ds-font-weight-regular: 400;
  --ds-font-weight-medium: 500;
  --ds-font-weight-semibold: 600;
  --ds-font-weight-bold: 653;
}
```

#### **字体层级**
```css
/* Typography Scale - Updated Design Tokens */
.ds-heading-display {
  font-family: var(--ds-font-family-sans);
  font-size: 48px;
  font-weight: var(--ds-font-weight-medium);
  line-height: 56px;
  letter-spacing: -0.02em;
}

.ds-heading-h1 {
  font-family: var(--ds-font-family-sans);
  font-size: 40px;
  font-weight: var(--ds-font-weight-medium);
  line-height: 48px;
  letter-spacing: -0.02em;
}

.ds-heading-h2 {
  font-family: var(--ds-font-family-sans);
  font-size: 32px;
  font-weight: var(--ds-font-weight-medium);
  line-height: 40px;
  letter-spacing: -0.01em;
}

.ds-heading-h3 {
  font-family: var(--ds-font-family-sans);
  font-size: 24px;
  font-weight: var(--ds-font-weight-medium);
  line-height: 32px;
  letter-spacing: -0.01em;
}

.ds-heading-h4 {
  font-family: var(--ds-font-family-sans);
  font-size: 20px;
  font-weight: var(--ds-font-weight-medium);
  line-height: 28px;
  letter-spacing: -0.01em;
}

.ds-heading-h5 {
  font-family: var(--ds-font-family-sans);
  font-size: 16px;
  font-weight: var(--ds-font-weight-semibold);
  line-height: 24px;
  letter-spacing: 0;
}

.ds-heading-h6 {
  font-family: var(--ds-font-family-sans);
  font-size: 14px;
  font-weight: var(--ds-font-weight-semibold);
  line-height: 20px;
  letter-spacing: 0;
  text-transform: uppercase;
}

.ds-body-large {
  font-family: var(--ds-font-family-sans);
  font-size: 16px;
  font-weight: var(--ds-font-weight-regular);
  line-height: 24px;
  letter-spacing: 0;
}

.ds-body {
  font-family: var(--ds-font-family-sans);
  font-size: 14px;
  font-weight: var(--ds-font-weight-regular);
  line-height: 20px;
  letter-spacing: 0;
}

.ds-body-small {
  font-family: var(--ds-font-family-sans);
  font-size: 12px;
  font-weight: var(--ds-font-weight-regular);
  line-height: 16px;
  letter-spacing: 0;
}

.ds-caption {
  font-family: var(--ds-font-family-sans);
  font-size: 11px;
  font-weight: var(--ds-font-weight-regular);
  line-height: 16px;
  letter-spacing: 0.5px;
}
```

### 间距系统 (Spacing)

#### **基于8px网格的间距系统 - Design Tokens**
```css
/* Spacing Scale - Atlassian Design System Tokens */
:root {
  --ds-space-0: 0px;
  --ds-space-025: 2px;   /* 0.25 * 8px */
  --ds-space-050: 4px;   /* 0.5 * 8px */
  --ds-space-075: 6px;   /* 0.75 * 8px */
  --ds-space-100: 8px;   /* 1 * 8px */
  --ds-space-150: 12px;  /* 1.5 * 8px */
  --ds-space-200: 16px;  /* 2 * 8px */
  --ds-space-250: 20px;  /* 2.5 * 8px */
  --ds-space-300: 24px;  /* 3 * 8px */
  --ds-space-400: 32px;  /* 4 * 8px */
  --ds-space-500: 40px;  /* 5 * 8px */
  --ds-space-600: 48px;  /* 6 * 8px */
  --ds-space-800: 64px;  /* 8 * 8px */
  --ds-space-1000: 80px; /* 10 * 8px */
}

/* Semantic spacing tokens */
:root {
  --ds-space-negative-025: -2px;
  --ds-space-negative-050: -4px;
  --ds-space-negative-075: -6px;
  --ds-space-negative-100: -8px;
  --ds-space-negative-150: -12px;
  --ds-space-negative-200: -16px;
  --ds-space-negative-250: -20px;
  --ds-space-negative-300: -24px;
  --ds-space-negative-400: -32px;
}
```

### 阴影系统 (Elevation)

```css
/* Atlassian Shadow System - Design Tokens */
:root {
  --ds-elevation-shadow-raised: 0px 1px 1px rgba(9, 30, 66, 0.25), 0px 0px 1px rgba(9, 30, 66, 0.31);
  --ds-elevation-shadow-overlay: 0px 4px 8px rgba(9, 30, 66, 0.25), 0px 0px 1px rgba(9, 30, 66, 0.31);
  --ds-elevation-shadow-popup: 0px 8px 12px rgba(9, 30, 66, 0.15), 0px 0px 1px rgba(9, 30, 66, 0.31);
  --ds-elevation-shadow-modal: 0px 20px 32px rgba(9, 30, 66, 0.15), 0px 0px 1px rgba(9, 30, 66, 0.31);
}

.ds-elevation-raised {
  box-shadow: var(--ds-elevation-shadow-raised);
}

.ds-elevation-overlay {
  box-shadow: var(--ds-elevation-shadow-overlay);
}

.ds-elevation-popup {
  box-shadow: var(--ds-elevation-shadow-popup);
}

.ds-elevation-modal {
  box-shadow: var(--ds-elevation-shadow-modal);
}
```

### 圆角系统 (Border Radius)

```css
/* Border Radius - Design Tokens */
:root {
  --ds-border-radius-050: 2px;   /* Small elements */
  --ds-border-radius-100: 4px;   /* Default radius */
  --ds-border-radius-200: 8px;   /* Medium elements */
  --ds-border-radius-300: 12px;  /* Large elements */
  --ds-border-radius-400: 16px;  /* Extra large */
  --ds-border-radius-round: 50%; /* Circular */
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

#### **Atlassian缓动曲线 - 2024 更新**
```css
/* Easing Functions - Design System Tokens */
:root {
  /* Standard easing curves */
  --ds-motion-easing-entrance: cubic-bezier(0.15, 1, 0.3, 1);
  --ds-motion-easing-exit: cubic-bezier(0.6, 0, 0.85, 0.15);
  --ds-motion-easing-standard: cubic-bezier(0.25, 0.1, 0.25, 1);
  --ds-motion-easing-decelerate: cubic-bezier(0, 0, 0.3, 1);
  --ds-motion-easing-accelerate: cubic-bezier(0.7, 0, 1, 0.5);
  
  /* Duration tokens */
  --ds-motion-duration-instant: 0ms;
  --ds-motion-duration-fast: 100ms;
  --ds-motion-duration-medium: 200ms;
  --ds-motion-duration-slow: 300ms;
  --ds-motion-duration-slower: 500ms;
}

/* Reduced motion support - Accessibility First */
@media (prefers-reduced-motion: reduce) {
  :root {
    --ds-motion-duration-instant: 0ms;
    --ds-motion-duration-fast: 0ms;
    --ds-motion-duration-medium: 0ms;
    --ds-motion-duration-slow: 0ms;
    --ds-motion-duration-slower: 0ms;
  }
  
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Motion classes */
.ds-motion-entrance {
  transition-timing-function: var(--ds-motion-easing-entrance);
  transition-duration: var(--ds-motion-duration-medium);
}

.ds-motion-exit {
  transition-timing-function: var(--ds-motion-easing-exit);
  transition-duration: var(--ds-motion-duration-medium);
}

.ds-motion-standard {
  transition-timing-function: var(--ds-motion-easing-standard);
  transition-duration: var(--ds-motion-duration-medium);
}

.ds-motion-fast {
  transition-duration: var(--ds-motion-duration-fast);
}

.ds-motion-slow {
  transition-duration: var(--ds-motion-duration-slow);
}
```

#### **动画时长指南 - 2024 更新**
- **即时反馈**: 0ms (--ds-motion-duration-instant)
- **微交互**: 100ms (--ds-motion-duration-fast) 
- **标准交互**: 200ms (--ds-motion-duration-medium)
- **复杂过渡**: 300ms (--ds-motion-duration-slow)
- **页面切换**: 500ms (--ds-motion-duration-slower)

#### **可访问性原则**
- **始终尊重 `prefers-reduced-motion`**: 用户设置优于设计偏好
- **提供有意义的动画**: 动画应该增强用户体验，而非装饰
- **保持一致性**: 相似的交互使用相同的动画模式
- **避免过度动画**: 减少眩晕和不适感

### 状态设计

#### **交互状态 - 2024 更新**
```css
/* Interactive States - Design System Compliant */
.ds-interactive {
  transition: all var(--ds-motion-duration-medium) var(--ds-motion-easing-standard);
  cursor: pointer;
}

.ds-interactive:hover {
  transform: translateY(-1px);
  box-shadow: var(--ds-elevation-shadow-raised);
}

.ds-interactive:active {
  transform: translateY(0);
  box-shadow: var(--ds-elevation-shadow-raised);
  transition-duration: var(--ds-motion-duration-fast);
}

.ds-interactive:focus {
  outline: 2px solid var(--ds-link);
  outline-offset: 2px;
  border-radius: var(--ds-border-radius-100);
}

.ds-interactive:focus:not(:focus-visible) {
  outline: none;
}

.ds-interactive:focus-visible {
  outline: 2px solid var(--ds-link);
  outline-offset: 2px;
}

.ds-interactive:disabled,
.ds-interactive[aria-disabled="true"] {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  color: var(--ds-text-disabled);
  background-color: var(--ds-background-neutral-subtle);
}

/* Loading state */
.ds-interactive--loading {
  cursor: wait;
  position: relative;
  color: transparent;
}

.ds-interactive--loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 16px;
  height: 16px;
  margin: -8px 0 0 -8px;
  border: 2px solid var(--ds-text-disabled);
  border-top-color: var(--ds-link);
  border-radius: 50%;
  animation: ds-spin 1s linear infinite;
}

@keyframes ds-spin {
  to {
    transform: rotate(360deg);
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .ds-interactive:focus {
    outline-width: 3px;
    outline-color: ButtonText;
  }
}
```

---

## 🧩 组件设计规范

### 按钮 (Buttons)

#### **主要按钮**
```css
.ds-button-primary {
  background: var(--ds-background-brand-bold);
  color: var(--ds-background-neutral);
  border: none;
  border-radius: var(--ds-border-radius-100);
  padding: var(--ds-space-100) var(--ds-space-200);
  font-family: var(--ds-font-family-sans);
  font-size: 14px;
  font-weight: var(--ds-font-weight-medium);
  min-height: 40px;
  cursor: pointer;
  transition: all 200ms cubic-bezier(0.25, 0.1, 0.25, 1);
}

.ds-button-primary:hover {
  background: var(--ds-background-brand-bold-hovered);
  transform: translateY(-1px);
  box-shadow: var(--ds-elevation-shadow-raised);
}

.ds-button-primary:active {
  background: var(--ds-background-brand-bold-pressed);
  transform: translateY(0);
}

.ds-button-primary:focus {
  outline: 2px solid var(--ds-link);
  outline-offset: 2px;
}
```

#### **次要按钮**
```css
.ds-button-secondary {
  background: var(--ds-background-neutral);
  color: var(--ds-text);
  border: 1px solid var(--ds-background-neutral-subtle-pressed);
  border-radius: var(--ds-border-radius-100);
  padding: var(--ds-space-100) var(--ds-space-200);
  font-family: var(--ds-font-family-sans);
  font-size: 14px;
  font-weight: var(--ds-font-weight-medium);
  min-height: 40px;
  cursor: pointer;
  transition: all 200ms cubic-bezier(0.25, 0.1, 0.25, 1);
}

.ds-button-secondary:hover {
  background: var(--ds-background-neutral-subtle-hovered);
  border-color: var(--ds-background-neutral-subtle-pressed);
}
```

#### **危险操作按钮**
```css
.ds-button-danger {
  background: var(--ds-background-danger-bold);
  color: var(--ds-background-neutral);
  border: none;
  border-radius: var(--ds-border-radius-100);
  padding: var(--ds-space-100) var(--ds-space-200);
  font-family: var(--ds-font-family-sans);
  font-size: 14px;
  font-weight: var(--ds-font-weight-medium);
  min-height: 40px;
  cursor: pointer;
  transition: all 200ms cubic-bezier(0.25, 0.1, 0.25, 1);
}

.ds-button-danger:hover {
  background: var(--ds-background-danger);
  box-shadow: var(--ds-elevation-shadow-raised);
}
```

### 表单控件

#### **输入框**
```css
.ds-input-field {
  background: var(--ds-background-neutral);
  border: 2px solid var(--ds-background-neutral-subtle-pressed);
  border-radius: var(--ds-border-radius-100);
  padding: var(--ds-space-100) var(--ds-space-150);
  font-family: var(--ds-font-family-sans);
  font-size: 14px;
  font-weight: var(--ds-font-weight-regular);
  line-height: 20px;
  color: var(--ds-text);
  min-height: 40px;
  transition: border-color 200ms cubic-bezier(0.25, 0.1, 0.25, 1);
}

.ds-input-field:focus {
  outline: none;
  border-color: var(--ds-link);
  box-shadow: 0 0 0 1px var(--ds-link);
}

.ds-input-field:invalid,
.ds-input-field[aria-invalid="true"] {
  border-color: var(--ds-background-danger-bold);
}

.ds-input-field:disabled {
  background: var(--ds-background-neutral-subtle);
  color: var(--ds-text-disabled);
  cursor: not-allowed;
  opacity: 0.6;
}

.ds-input-field::placeholder {
  color: var(--ds-text-subtlest);
}
```

#### **选择器**
```css
.ds-select-field {
  position: relative;
  background: var(--ds-background-neutral);
  border: 2px solid var(--ds-background-neutral-subtle-pressed);
  border-radius: var(--ds-border-radius-100);
  padding: var(--ds-space-100) var(--ds-space-400) var(--ds-space-100) var(--ds-space-150);
  font-family: var(--ds-font-family-sans);
  font-size: 14px;
  font-weight: var(--ds-font-weight-regular);
  color: var(--ds-text);
  min-height: 40px;
  cursor: pointer;
  transition: border-color 200ms cubic-bezier(0.25, 0.1, 0.25, 1);
}

.ds-select-field:focus {
  outline: none;
  border-color: var(--ds-link);
  box-shadow: 0 0 0 1px var(--ds-link);
}

.ds-select-field::after {
  content: '';
  position: absolute;
  right: var(--ds-space-150);
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 4px solid var(--ds-text-subtle);
  pointer-events: none;
}

.ds-select-field:disabled {
  background: var(--ds-background-neutral-subtle);
  color: var(--ds-text-disabled);
  cursor: not-allowed;
  opacity: 0.6;
}
```

### 卡片和容器

#### **卡片组件**
```css
.ds-card {
  background: var(--ds-background-neutral);
  border: 1px solid var(--ds-background-neutral-subtle-pressed);
  border-radius: var(--ds-border-radius-200);
  padding: var(--ds-space-300);
  box-shadow: var(--ds-elevation-shadow-raised);
  transition: all 200ms cubic-bezier(0.25, 0.1, 0.25, 1);
}

.ds-card:hover {
  box-shadow: var(--ds-elevation-shadow-overlay);
  transform: translateY(-2px);
}

.ds-card:focus-within {
  outline: 2px solid var(--ds-link);
  outline-offset: 2px;
}

.ds-card-header {
  margin-bottom: var(--ds-space-200);
  padding-bottom: var(--ds-space-200);
  border-bottom: 1px solid var(--ds-background-neutral-subtle-pressed);
}

.ds-card-title {
  font-family: var(--ds-font-family-sans);
  font-size: 20px;
  font-weight: var(--ds-font-weight-medium);
  color: var(--ds-text);
  margin: 0;
  line-height: 28px;
}

.ds-card-content {
  color: var(--ds-text-subtle);
  font-family: var(--ds-font-family-sans);
  font-size: 14px;
  line-height: 20px;
}

/* Interactive card variant */
.ds-card--interactive {
  cursor: pointer;
}

.ds-card--interactive:hover {
  border-color: var(--ds-link);
}

.ds-card--interactive:active {
  transform: translateY(0);
  box-shadow: var(--ds-elevation-shadow-raised);
}
```

### 导航组件

#### **顶部导航栏**
```css
.ds-navbar {
  background: var(--ds-background-neutral);
  border-bottom: 1px solid var(--ds-background-neutral-subtle-pressed);
  padding: var(--ds-space-150) var(--ds-space-300);
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 64px;
}

.ds-navbar-brand {
  font-family: var(--ds-font-family-sans);
  font-size: 20px;
  font-weight: var(--ds-font-weight-semibold);
  color: var(--ds-link);
  text-decoration: none;
  transition: color 200ms cubic-bezier(0.25, 0.1, 0.25, 1);
}

.ds-navbar-brand:hover {
  color: var(--ds-link-pressed);
}

.ds-navbar-brand:focus {
  outline: 2px solid var(--ds-link);
  outline-offset: 2px;
  border-radius: var(--ds-border-radius-100);
}

.ds-navbar-nav {
  display: flex;
  align-items: center;
  gap: var(--ds-space-300);
  list-style: none;
  margin: 0;
  padding: 0;
}

.ds-navbar-item {
  padding: var(--ds-space-100) var(--ds-space-150);
  border-radius: var(--ds-border-radius-100);
  color: var(--ds-text-subtle);
  text-decoration: none;
  font-family: var(--ds-font-family-sans);
  font-size: 14px;
  font-weight: var(--ds-font-weight-medium);
  transition: all 200ms cubic-bezier(0.25, 0.1, 0.25, 1);
}

.ds-navbar-item:hover {
  background: var(--ds-background-neutral-subtle-hovered);
  color: var(--ds-text);
}

.ds-navbar-item:focus {
  outline: 2px solid var(--ds-link);
  outline-offset: 2px;
}

.ds-navbar-item--active {
  background: var(--ds-background-brand-bold);
  color: var(--ds-background-neutral);
}

.ds-navbar-item--active:hover {
  background: var(--ds-background-brand-bold-hovered);
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