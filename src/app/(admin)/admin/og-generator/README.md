# OG Image Generator

A modern, TypeScript-based OG (Open Graph) image generator for AI Magellan.

## Features

- ✨ **Modern Design**: Uses AI Magellan's design system with Atlassian colors
- 🎨 **Professional Branding**: Includes AI Magellan logo and brand colors
- 📱 **Responsive Layout**: Framer Motion animations and responsive grid
- 🖼️ **7 Image Types**: All social media formats covered
- ⬇️ **One-Click Download**: Download any image instantly

## Usage

### Access the Page

Visit: `http://localhost:3000/tools/og-generator`

Or in production: `https://yoursite.com/tools/og-generator`

### Generated Images

1. **Default OG Image** (1200×630px) - Default Open Graph share image
2. **Home Page OG** (1200×630px) - Homepage featured image
3. **Categories OG** (1200×630px) - Category pages image
4. **Rankings OG** (1200×630px) - Rankings page image
5. **Twitter Image** (1200×600px) - Twitter share image
6. **Twitter Summary** (280×150px) - Twitter summary card
7. **Brand Banner** (1200×300px) - Brand banner

### How to Download

1. The page automatically generates all images when loaded
2. Click the "Download" button on any image card
3. The image will be saved to your downloads folder

### Technical Details

- **Framework**: Next.js 15 + TypeScript
- **UI Components**: Reuses existing design system components
- **Animations**: Framer Motion for smooth transitions
- **Canvas Rendering**: HTML5 Canvas API with custom drawing functions
- **Logo**: Automatically loads from `/public/logo-2.png`

## Design System

The page uses the following design tokens:

### Colors
- **Primary**: `#0052CC` (Atlassian Blue)
- **Magellan Primary**: `#0B4F8C` (Deep Ocean Blue)
- **Magellan Teal**: `#0F766E`
- **AI Discovery**: `#00C7E6`
- **AI Success**: `#36B37E`
- **AI Innovation**: `#6554C0`
- **AI Premium**: `#FFAB00`

### Components Used
- `Card` - Main container
- `Button` - Actions
- `Badge` - Labels and status
- Lucide Icons - All icons

## Customization

To add new image types:

1. Add to the `OG_IMAGES` array
2. Create a new `generate[Name]` function
3. Add case in `generateImage` switch statement

Example:

```typescript
const OG_IMAGES = [
  // ... existing images
  {
    id: 'custom-image',
    name: 'Custom Image',
    width: 1200,
    height: 630,
    description: 'Your custom description'
  }
]

const generateCustomImage = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Your drawing code here
}
```

## Browser Compatibility

- Chrome/Edge: ✅ Fully supported
- Firefox: ✅ Fully supported
- Safari: ✅ Fully supported
- Mobile browsers: ✅ Responsive design

## Performance

- Logo is loaded once and cached
- Images are generated on-demand
- Canvas rendering is optimized for smooth performance
- Lazy loading for better initial page load

## License

Part of AI Magellan project
