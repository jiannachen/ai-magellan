# Apple Design System Specification
## 苹果产品设计理念与UI交互规范文档

### 📖 目录
1. [核心设计理念](#核心设计理念)
2. [视觉设计系统](#视觉设计系统)
3. [交互设计原则](#交互设计原则)
4. [组件设计规范](#组件设计规范)
5. [布局与间距](#布局与间距)
6. [实施指南](#实施指南)

---

## 🎯 核心设计理念

### 三大核心原则

#### 1. **Clarity (清晰性)**
- **定义**: 确保每个元素都易于理解，专注于极简设计和直观导航
- **执行标准**:
  - 文字清晰可读，最小字号11pt
  - 图标含义明确，无歧义
  - 色彩对比度符合WCAG AA标准（4.5:1）
  - 去除不必要的装饰元素

#### 2. **Deference (克制性)**
- **定义**: 减少干扰，让用户专注于核心任务
- **执行标准**:
  - 界面元素不应抢夺内容焦点
  - 使用留白创造呼吸感
  - 动画效果应增强而非干扰体验
  - 避免过度设计和华丽效果

#### 3. **Depth (层次感)**
- **定义**: 通过分层、阴影和视觉效果创造层次和多维体验
- **执行标准**:
  - 使用阴影和模糊创造深度
  - 建立清晰的视觉层级
  - 通过动画展示空间关系
  - 引导用户自然地浏览界面

---

## 🎨 视觉设计系统

### 字体系统 (Typography)

#### **主字体家族**: San Francisco (SF)
```css
/* 系统字体层级 */
.text-largeTitle {
  font-size: 34px;
  font-weight: 400;
  line-height: 41px;
  letter-spacing: 0.37px;
}

.text-title1 {
  font-size: 28px;
  font-weight: 400;
  line-height: 34px;
  letter-spacing: 0.36px;
}

.text-title2 {
  font-size: 22px;
  font-weight: 400;
  line-height: 28px;
  letter-spacing: 0.35px;
}

.text-title3 {
  font-size: 20px;
  font-weight: 400;
  line-height: 25px;
  letter-spacing: 0.38px;
}

.text-headline {
  font-size: 17px;
  font-weight: 600;
  line-height: 22px;
  letter-spacing: -0.43px;
}

.text-body {
  font-size: 17px;
  font-weight: 400;
  line-height: 22px;
  letter-spacing: -0.43px;
}

.text-callout {
  font-size: 16px;
  font-weight: 400;
  line-height: 21px;
  letter-spacing: -0.32px;
}

.text-subhead {
  font-size: 15px;
  font-weight: 400;
  line-height: 20px;
  letter-spacing: -0.24px;
}

.text-footnote {
  font-size: 13px;
  font-weight: 400;
  line-height: 18px;
  letter-spacing: -0.08px;
}

.text-caption1 {
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  letter-spacing: 0px;
}

.text-caption2 {
  font-size: 11px;
  font-weight: 400;
  line-height: 13px;
  letter-spacing: 0.07px;
}
```

#### **字重使用原则**
- **Regular (400)**: 正文内容
- **Medium (500)**: 次要标题
- **Semibold (600)**: 重要信息
- **Bold (700)**: 主要标题（谨慎使用）

### 色彩系统 (Color System)

#### **系统色彩**
```css
/* Light Mode */
:root {
  /* 主要色彩 */
  --color-blue: #007AFF;
  --color-green: #34C759;
  --color-indigo: #5856D6;
  --color-orange: #FF9500;
  --color-pink: #FF2D92;
  --color-purple: #AF52DE;
  --color-red: #FF3B30;
  --color-teal: #5AC8FA;
  --color-yellow: #FFCC00;
  
  /* 灰度色彩 */
  --color-gray: #8E8E93;
  --color-gray2: #AEAEB2;
  --color-gray3: #C7C7CC;
  --color-gray4: #D1D1D6;
  --color-gray5: #E5E5EA;
  --color-gray6: #F2F2F7;
  
  /* 标签色彩 */
  --label-primary: #000000;
  --label-secondary: rgba(60, 60, 67, 0.6);
  --label-tertiary: rgba(60, 60, 67, 0.3);
  --label-quaternary: rgba(60, 60, 67, 0.18);
  
  /* 填充色彩 */
  --fill-primary: rgba(120, 120, 128, 0.2);
  --fill-secondary: rgba(120, 120, 128, 0.16);
  --fill-tertiary: rgba(120, 120, 128, 0.12);
  --fill-quaternary: rgba(120, 120, 128, 0.08);
  
  /* 背景色彩 */
  --background-primary: #FFFFFF;
  --background-secondary: #F2F2F7;
  --background-tertiary: #FFFFFF;
  
  /* 分组背景 */
  --grouped-background-primary: #F2F2F7;
  --grouped-background-secondary: #FFFFFF;
  --grouped-background-tertiary: #F2F2F7;
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  :root {
    /* 标签色彩 */
    --label-primary: #FFFFFF;
    --label-secondary: rgba(235, 235, 245, 0.6);
    --label-tertiary: rgba(235, 235, 245, 0.3);
    --label-quaternary: rgba(235, 235, 245, 0.18);
    
    /* 填充色彩 */
    --fill-primary: rgba(120, 120, 128, 0.36);
    --fill-secondary: rgba(120, 120, 128, 0.32);
    --fill-tertiary: rgba(120, 120, 128, 0.28);
    --fill-quaternary: rgba(120, 120, 128, 0.24);
    
    /* 背景色彩 */
    --background-primary: #000000;
    --background-secondary: #1C1C1E;
    --background-tertiary: #2C2C2E;
    
    /* 分组背景 */
    --grouped-background-primary: #000000;
    --grouped-background-secondary: #1C1C1E;
    --grouped-background-tertiary: #2C2C2E;
  }
}
```

#### **色彩使用原则**
- **蓝色 (#007AFF)**: 主要操作、链接、选择状态
- **绿色 (#34C759)**: 成功状态、确认操作
- **红色 (#FF3B30)**: 错误状态、危险操作、删除
- **橙色 (#FF9500)**: 警告状态、待处理
- **灰色系**: 次要信息、不可用状态

### 阴影系统 (Shadows)

```css
/* 阴影层级 */
.shadow-1 {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.shadow-2 {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.shadow-3 {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.shadow-4 {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

### 圆角系统 (Border Radius)

```css
/* 圆角层级 */
.radius-xs { border-radius: 4px; }
.radius-sm { border-radius: 6px; }
.radius-md { border-radius: 8px; }
.radius-lg { border-radius: 12px; }
.radius-xl { border-radius: 16px; }
.radius-2xl { border-radius: 20px; }
.radius-full { border-radius: 50%; }
```

---

## 🖱️ 交互设计原则

### 触摸目标规范

#### **最小触摸区域**
- **移动端**: 44pt × 44pt (最小值)
- **桌面端**: 28pt × 28pt (最小值)
- **推荐尺寸**: 48pt × 48pt

#### **间距要求**
- 相邻可点击元素间距 ≥ 8pt
- 危险操作与其他元素间距 ≥ 16pt

### 反馈机制

#### **视觉反馈**
```css
/* 按钮状态 */
.button {
  transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.button:hover {
  opacity: 0.8;
  transform: translateY(-1px);
}

.button:active {
  opacity: 0.6;
  transform: translateY(0);
}
```

#### **触觉反馈 (Haptic Feedback)**
- **轻触反馈**: 成功操作、确认选择
- **中度反馈**: 警告、重要操作
- **重度反馈**: 错误、失败操作

### 动画原则

#### **缓动函数 (Easing)**
```css
/* 标准缓动曲线 */
.ease-standard { transition-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94); }
.ease-decelerate { transition-timing-function: cubic-bezier(0, 0, 0.2, 1); }
.ease-accelerate { transition-timing-function: cubic-bezier(0.4, 0, 1, 1); }
.ease-sharp { transition-timing-function: cubic-bezier(0.4, 0, 0.6, 1); }
```

#### **动画时长**
- **微交互**: 100-200ms
- **页面切换**: 300-400ms
- **复杂动画**: 400-600ms
- **避免**: >600ms的动画

---

## 🧩 组件设计规范

### 按钮 (Buttons)

#### **主要按钮 (Primary Button)**
```css
.btn-primary {
  background: var(--color-blue);
  color: white;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 17px;
  font-weight: 600;
  border: none;
  min-height: 44px;
}
```

#### **次要按钮 (Secondary Button)**
```css
.btn-secondary {
  background: transparent;
  color: var(--color-blue);
  border: 1px solid var(--color-blue);
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 17px;
  font-weight: 400;
  min-height: 44px;
}
```

#### **文本按钮 (Text Button)**
```css
.btn-text {
  background: transparent;
  color: var(--color-blue);
  border: none;
  padding: 8px 16px;
  font-size: 17px;
  font-weight: 400;
  min-height: 44px;
}
```

### 表单控件 (Form Controls)

#### **输入框 (Text Field)**
```css
.text-field {
  background: var(--background-secondary);
  border: 1px solid var(--fill-tertiary);
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 17px;
  min-height: 44px;
}

.text-field:focus {
  border-color: var(--color-blue);
  outline: none;
  background: var(--background-primary);
}
```

#### **选择器 (Picker)**
```css
.picker {
  background: var(--background-secondary);
  border-radius: 12px;
  overflow: hidden;
}

.picker-item {
  padding: 16px;
  border-bottom: 1px solid var(--fill-quaternary);
  font-size: 17px;
}
```

### 导航 (Navigation)

#### **标签栏 (Tab Bar)**
```css
.tab-bar {
  background: var(--background-primary);
  border-top: 1px solid var(--fill-quaternary);
  padding: 8px 0;
  display: flex;
  justify-content: space-around;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 8px;
  min-width: 44px;
  min-height: 44px;
}

.tab-icon {
  width: 24px;
  height: 24px;
  margin-bottom: 2px;
}

.tab-title {
  font-size: 10px;
  font-weight: 500;
}
```

#### **导航栏 (Navigation Bar)**
```css
.nav-bar {
  background: var(--background-primary);
  border-bottom: 1px solid var(--fill-quaternary);
  padding: 16px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-title {
  font-size: 17px;
  font-weight: 600;
  text-align: center;
  flex: 1;
}
```

---

## 📐 布局与间距

### 网格系统

#### **8pt网格系统**
```css
/* 间距单位 */
.space-1 { margin: 4px; }   /* 0.5 * 8pt */
.space-2 { margin: 8px; }   /* 1 * 8pt */
.space-3 { margin: 12px; }  /* 1.5 * 8pt */
.space-4 { margin: 16px; }  /* 2 * 8pt */
.space-5 { margin: 20px; }  /* 2.5 * 8pt */
.space-6 { margin: 24px; }  /* 3 * 8pt */
.space-8 { margin: 32px; }  /* 4 * 8pt */
.space-10 { margin: 40px; } /* 5 * 8pt */
.space-12 { margin: 48px; } /* 6 * 8pt */
.space-16 { margin: 64px; } /* 8 * 8pt */
```

### 安全区域 (Safe Area)

#### **边距规范**
```css
/* 页面边距 */
.container-mobile {
  padding: 16px; /* iPhone */
}

.container-tablet {
  padding: 32px; /* iPad */
}

.container-desktop {
  padding: 48px; /* Mac */
}
```

#### **内容区域**
```css
/* 内容最大宽度 */
.content-width {
  max-width: 428px; /* iPhone 14 Pro Max */
  margin: 0 auto;
}

.content-width-tablet {
  max-width: 768px; /* iPad */
  margin: 0 auto;
}

.content-width-desktop {
  max-width: 1200px; /* Mac */
  margin: 0 auto;
}
```

---

## 🚀 实施指南

### 设计令牌 (Design Tokens)

#### **创建设计令牌文件**
```json
{
  "colors": {
    "blue": {
      "50": "#E3F2FD",
      "500": "#007AFF",
      "900": "#0051D5"
    }
  },
  "spacing": {
    "xs": "4px",
    "sm": "8px",
    "md": "16px",
    "lg": "24px",
    "xl": "32px"
  },
  "typography": {
    "fontFamily": {
      "system": "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    },
    "fontSize": {
      "caption2": "11px",
      "caption1": "12px",
      "footnote": "13px",
      "subhead": "15px",
      "callout": "16px",
      "body": "17px",
      "headline": "17px",
      "title3": "20px",
      "title2": "22px",
      "title1": "28px",
      "largeTitle": "34px"
    }
  }
}
```

### 组件库结构

```
components/
├── foundations/
│   ├── colors.css
│   ├── typography.css
│   ├── spacing.css
│   └── shadows.css
├── components/
│   ├── buttons/
│   ├── forms/
│   ├── navigation/
│   └── feedback/
└── patterns/
    ├── layouts/
    ├── templates/
    └── flows/
```

### 质量检查清单

#### **设计自检**
- [ ] 所有触摸目标 ≥ 44pt × 44pt
- [ ] 文字对比度 ≥ 4.5:1
- [ ] 使用系统字体和标准字号
- [ ] 遵循8pt网格系统
- [ ] 支持深色模式
- [ ] 动画时长合理 (≤ 400ms)
- [ ] 提供适当的反馈

#### **代码实现**
- [ ] 使用语义化HTML
- [ ] 支持键盘导航
- [ ] 实现ARIA标签
- [ ] 响应式设计
- [ ] 性能优化

### 工具推荐

#### **设计工具**
- **Figma**: 界面设计、原型制作
- **Sketch**: Mac平台设计工具
- **Apple Design Resources**: 官方设计资源

#### **开发工具**
- **SF Symbols**: 苹果图标库
- **Xcode**: iOS开发环境
- **Web Inspector**: Safari开发者工具

---

## 📚 参考资源

### 官方文档
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Apple Design Resources](https://developer.apple.com/design/resources/)
- [SF Symbols](https://developer.apple.com/sf-symbols/)

### 设计系统案例
- iOS 系统应用
- macOS 系统应用
- Apple 官网设计

---

**文档版本**: 1.0  
**最后更新**: 2024年10月  
**维护者**: 设计团队

> 💡 **提示**: 本规范基于Apple最新的Human Interface Guidelines制定，建议定期查看官方更新并相应调整设计规范。