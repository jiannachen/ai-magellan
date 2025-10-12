# PWA图标资源

本目录包含PWA (渐进式Web应用) 所需的所有图标尺寸：

## 必需的图标尺寸
- `icon-72x72.png` - 小尺寸图标
- `icon-96x96.png` - 中等尺寸图标
- `icon-128x128.png` - 标准尺寸图标
- `icon-144x144.png` - 高密度小尺寸
- `icon-152x152.png` - iPad图标
- `icon-192x192.png` - Android标准图标
- `icon-384x384.png` - 大尺寸图标
- `icon-512x512.png` - 最大尺寸图标

## 快捷方式图标
- `shortcut-submit.png` (96x96) - 提交工具快捷方式
- `shortcut-rankings.png` (96x96) - 排行榜快捷方式

## 图标设计要求
1. 使用PNG格式，透明背景
2. 圆角设计，适配不同平台
3. 主色调使用品牌色 (#3b82f6)
4. 简洁清晰，在小尺寸下仍可识别
5. 支持maskable图标标准

## 自动生成
可以使用以下工具从单个高分辨率源图标生成所有尺寸：
- PWA Builder (https://www.pwabuilder.com/)
- Favicon Generator (https://realfavicongenerator.net/)
- 或者使用构建脚本自动生成