'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/common/card'
import { Button } from '@/ui/common/button'
import { Badge } from '@/ui/common/badge'
import {
  Image as ImageIcon,
  Download,
  RefreshCw,
  Compass,
  Anchor,
  Ship,
  Waves,
  Map as MapIcon,
  Telescope,
  Crown,
  Sparkles
} from 'lucide-react'

// Brand colors from design system
const COLORS = {
  // Atlassian Brand Colors
  primary: '#0052CC',
  primaryHover: '#0747A6',
  primaryLight: '#2684FF',

  // AI Magellan Ocean Theme
  magellanPrimary: '#0B4F8C',
  magellanLight: '#4A90E2',
  magellanNavy: '#1E3A8A',
  magellanTeal: '#0F766E',

  // AI Theme Colors
  aiDiscovery: '#00C7E6',
  aiSuccess: '#36B37E',
  aiInnovation: '#6554C0',
  aiPremium: '#FFAB00',

  // Text Colors
  text: '#172B4D',
  textSubtle: '#626F86',
  textSubtlest: '#758195',

  // Neutral Colors
  white: '#FFFFFF',
  neutral: '#F7F8F9',
  border: '#DFE1E6',
}

interface OGImage {
  id: string
  name: string
  width: number
  height: number
  description: string
}

const OG_IMAGES: OGImage[] = [
  {
    id: 'og-default',
    name: 'Default OG Image',
    width: 1200,
    height: 630,
    description: '1200 × 630px - Default Open Graph image'
  },
  {
    id: 'og-home',
    name: 'Home Page OG',
    width: 1200,
    height: 630,
    description: '1200 × 630px - Homepage featured image'
  },
  {
    id: 'og-categories',
    name: 'Categories OG',
    width: 1200,
    height: 630,
    description: '1200 × 630px - Category pages image'
  },
  {
    id: 'og-rankings',
    name: 'Rankings OG',
    width: 1200,
    height: 630,
    description: '1200 × 630px - Rankings page image'
  },
  {
    id: 'twitter-image',
    name: 'Twitter Image',
    width: 1200,
    height: 600,
    description: '1200 × 600px - Twitter share image'
  },
  {
    id: 'twitter-summary',
    name: 'Twitter Summary',
    width: 280,
    height: 150,
    description: '280 × 150px - Twitter summary card'
  },
  {
    id: 'brand-banner',
    name: 'Brand Banner',
    width: 1200,
    height: 300,
    description: '1200 × 300px - Brand banner'
  }
]

export default function OGGeneratorPage() {
  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null)
  const [generatedImages, setGeneratedImages] = useState<Map<string, string>>(new Map<string, string>())
  const [loading, setLoading] = useState(true)
  const canvasRefs = useRef<Map<string, HTMLCanvasElement>>(new Map<string, HTMLCanvasElement>())

  // Load logo
  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = '/logo-2.png'
    img.onload = () => {
      setLogoImage(img)
      setLoading(false)
    }
    img.onerror = () => {
      console.error('Failed to load logo')
      setLoading(false)
    }
  }, [])

  // Generate all images when logo loads
  useEffect(() => {
    if (logoImage && !loading) {
      OG_IMAGES.forEach(image => {
        generateImage(image.id)
      })
    }
  }, [logoImage, loading])

  const drawLogo = (ctx: CanvasRenderingContext2D, x: number, y: number, height: number) => {
    if (logoImage && logoImage.complete && logoImage.naturalHeight !== 0) {
      const aspectRatio = logoImage.width / logoImage.height
      const width = height * aspectRatio
      try {
        ctx.drawImage(logoImage, x, y, width, height)
      } catch (e) {
        console.error('Error drawing logo:', e)
      }
    }
  }

  const drawOceanBackground = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    variant: 'light' | 'dark' | 'atlassian' = 'light'
  ) => {
    const gradient = ctx.createLinearGradient(0, 0, width, height)

    if (variant === 'light') {
      gradient.addColorStop(0, COLORS.magellanPrimary)
      gradient.addColorStop(1, COLORS.magellanLight)
    } else if (variant === 'dark') {
      gradient.addColorStop(0, COLORS.magellanNavy)
      gradient.addColorStop(1, COLORS.magellanPrimary)
    } else {
      gradient.addColorStop(0, COLORS.primary)
      gradient.addColorStop(1, COLORS.primaryLight)
    }

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Wave patterns
    ctx.globalAlpha = 0.08
    for (let i = 0; i < 3; i++) {
      ctx.beginPath()
      const yOffset = height * (0.3 + i * 0.2)
      ctx.moveTo(0, yOffset)
      for (let x = 0; x <= width; x += 50) {
        const y = yOffset + Math.sin((x + i * 100) * 0.01) * 30
        ctx.lineTo(x, y)
      }
      ctx.lineTo(width, height)
      ctx.lineTo(0, height)
      ctx.closePath()
      ctx.fillStyle = COLORS.white
      ctx.fill()
    }
    ctx.globalAlpha = 1.0
  }

  const roundRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) => {
    if (w < 2 * r) r = w / 2
    if (h < 2 * r) r = h / 2
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.arcTo(x + w, y, x + w, y + h, r)
    ctx.arcTo(x + w, y + h, x, y + h, r)
    ctx.arcTo(x, y + h, x, y, r)
    ctx.arcTo(x, y, x + w, y, r)
    ctx.closePath()
  }

  const generateOGDefault = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = canvas
    drawOceanBackground(ctx, width, height, 'light')

    // Main content card
    ctx.fillStyle = 'rgba(255, 255, 255, 0.97)'
    roundRect(ctx, 80, 100, width - 160, height - 180, 20)
    ctx.fill()

    // Draw logo
    const logoHeight = 140
    const logoX = width / 2 - (logoHeight * (logoImage ? logoImage.width / logoImage.height : 2)) / 2
    drawLogo(ctx, logoX, 140, logoHeight)

    // Text
    ctx.fillStyle = COLORS.text
    ctx.font = '40px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Navigate the AI Frontier', width / 2, 340)

    ctx.fillStyle = COLORS.textSubtle
    ctx.font = '30px Inter, sans-serif'
    ctx.fillText('Discover · Explore · Master AI Tools', width / 2, 400)

    ctx.fillStyle = COLORS.aiDiscovery
    ctx.font = 'bold 26px Inter, sans-serif'
    ctx.fillText('Your AI Navigation Companion', width / 2, 460)
  }

  const generateOGHome = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = canvas
    drawOceanBackground(ctx, width, height, 'dark')

    // Main card
    ctx.fillStyle = 'rgba(255, 255, 255, 0.98)'
    roundRect(ctx, 60, 80, width - 120, height - 160, 24)
    ctx.fill()

    // Logo
    const logoHeight = 120
    const logoX = width / 2 - (logoHeight * (logoImage ? logoImage.width / logoImage.height : 2)) / 2
    drawLogo(ctx, logoX, 110, logoHeight)

    // Badge
    ctx.fillStyle = COLORS.aiPremium
    roundRect(ctx, width / 2 - 140, 260, 280, 44, 22)
    ctx.fill()
    ctx.fillStyle = COLORS.white
    ctx.font = 'bold 22px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('AI NAVIGATION PIONEER', width / 2, 290)

    // Title
    ctx.fillStyle = COLORS.magellanPrimary
    ctx.font = 'bold 56px Inter, sans-serif'
    ctx.fillText('Discover AI Treasures', width / 2, 365)

    ctx.fillStyle = COLORS.text
    ctx.font = '28px Inter, sans-serif'
    ctx.fillText('Expert Curated · In-depth Reviews · Real-time Updates', width / 2, 410)

    // Stats
    const stats = [
      { label: 'AI Tools', value: '500+', color: COLORS.aiSuccess },
      { label: 'Categories', value: '50+', color: COLORS.aiInnovation },
      { label: 'Users', value: '10K+', color: COLORS.aiPremium }
    ]

    const statsY = 480
    stats.forEach((stat, i) => {
      const x = (width / 4) * (i + 1)
      ctx.fillStyle = stat.color
      ctx.font = 'bold 42px Inter, sans-serif'
      ctx.fillText(stat.value, x, statsY)

      ctx.fillStyle = COLORS.textSubtle
      ctx.font = '20px Inter, sans-serif'
      ctx.fillText(stat.label, x, statsY + 38)
    })
  }

  const generateOGCategories = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = canvas
    drawOceanBackground(ctx, width, height, 'atlassian')

    // Main card
    ctx.fillStyle = 'rgba(255, 255, 255, 0.97)'
    roundRect(ctx, 100, 100, width - 200, height - 200, 20)
    ctx.fill()

    // Logo
    const logoHeight = 80
    const logoX = width / 2 - (logoHeight * (logoImage ? logoImage.width / logoImage.height : 2)) / 2
    drawLogo(ctx, logoX, 120, logoHeight)

    // Title
    ctx.fillStyle = COLORS.primary
    ctx.font = 'bold 52px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Explore AI Categories', width / 2, 250)

    // Categories with icons
    const categories = [
      { label: 'Writing', icon: '✍️', color: COLORS.aiSuccess },
      { label: 'Image', icon: '🎨', color: COLORS.aiInnovation },
      { label: 'Video', icon: '🎬', color: COLORS.aiPremium },
      { label: 'Audio', icon: '🎵', color: COLORS.aiDiscovery }
    ]

    categories.forEach((cat, i) => {
      const x = 220 + i * 220
      const y = 380

      ctx.beginPath()
      ctx.arc(x, y, 45, 0, Math.PI * 2)
      ctx.fillStyle = cat.color
      ctx.fill()

      ctx.font = '36px sans-serif'
      ctx.fillText(cat.icon, x, y + 12)

      ctx.fillStyle = COLORS.text
      ctx.font = '22px Inter, sans-serif'
      ctx.fillText(cat.label, x, y + 80)
    })
  }

  const generateOGRankings = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = canvas
    drawOceanBackground(ctx, width, height, 'dark')

    // Main card
    ctx.fillStyle = 'rgba(255, 255, 255, 0.97)'
    roundRect(ctx, 80, 70, width - 160, height - 140, 20)
    ctx.fill()

    // Trophy
    const trophyX = width / 2
    const trophyY = 145
    ctx.fillStyle = COLORS.aiPremium
    ctx.beginPath()
    ctx.arc(trophyX, trophyY, 55, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillRect(trophyX - 35, trophyY + 45, 70, 45)
    ctx.fillRect(trophyX - 50, trophyY + 90, 100, 18)

    // Shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.beginPath()
    ctx.arc(trophyX - 15, trophyY - 15, 20, 0, Math.PI * 2)
    ctx.fill()

    // Title
    ctx.fillStyle = COLORS.magellanPrimary
    ctx.font = 'bold 54px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('AI Tools Rankings', width / 2, 300)

    ctx.fillStyle = COLORS.text
    ctx.font = '28px Inter, sans-serif'
    ctx.fillText('Discover Top-Rated AI Solutions', width / 2, 350)

    // Rankings
    const ranks = ['🥇', '🥈', '🥉']
    ranks.forEach((rank, i) => {
      const x = (width / 4) * (i + 1)
      ctx.font = '48px sans-serif'
      ctx.fillText(rank, x, 430)
    })

    // Logo at bottom
    const logoHeight = 45
    const logoX = width / 2 - (logoHeight * (logoImage ? logoImage.width / logoImage.height : 2)) / 2
    ctx.globalAlpha = 0.7
    drawLogo(ctx, logoX, height - 80, logoHeight)
    ctx.globalAlpha = 1.0
  }

  const generateTwitterImage = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = canvas
    drawOceanBackground(ctx, width, height, 'light')

    // Content card
    ctx.fillStyle = 'rgba(255, 255, 255, 0.97)'
    roundRect(ctx, 60, 70, width - 120, height - 140, 20)
    ctx.fill()

    // Logo
    const logoHeight = 100
    const logoX = width / 2 - (logoHeight * (logoImage ? logoImage.width / logoImage.height : 2)) / 2
    drawLogo(ctx, logoX, 100, logoHeight)

    // Text
    ctx.fillStyle = COLORS.text
    ctx.font = '36px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Navigate the AI Frontier', width / 2, 270)

    ctx.fillStyle = COLORS.magellanPrimary
    ctx.font = 'bold 30px Inter, sans-serif'
    ctx.fillText('Discover · Explore · Master', width / 2, 325)

    ctx.fillStyle = COLORS.aiDiscovery
    ctx.font = 'bold 28px Inter, sans-serif'
    ctx.fillText('aimagellan.com', width / 2, 385)
  }

  const generateTwitterSummary = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = canvas
    drawOceanBackground(ctx, width, height, 'light')

    // Logo
    const logoHeight = 45
    drawLogo(ctx, 8, height / 2 - logoHeight / 2, logoHeight)

    // Text
    const logoWidth = logoHeight * (logoImage ? logoImage.width / logoImage.height : 2)
    ctx.fillStyle = COLORS.white
    ctx.font = 'bold 24px Inter, sans-serif'
    ctx.textAlign = 'left'
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
    ctx.shadowBlur = 4
    ctx.fillText('AI Magellan', logoWidth + 18, 65)

    ctx.font = '13px Inter, sans-serif'
    ctx.fillText('AI Tool Navigator', logoWidth + 18, 88)
    ctx.shadowBlur = 0
  }

  const generateBrandBanner = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = canvas

    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, 0)
    gradient.addColorStop(0, COLORS.magellanNavy)
    gradient.addColorStop(0.5, COLORS.magellanPrimary)
    gradient.addColorStop(1, COLORS.magellanTeal)
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Wave overlay
    ctx.globalAlpha = 0.05
    ctx.beginPath()
    ctx.moveTo(0, height * 0.6)
    for (let x = 0; x <= width; x += 30) {
      const y = height * 0.6 + Math.sin(x * 0.01) * 20
      ctx.lineTo(x, y)
    }
    ctx.lineTo(width, height)
    ctx.lineTo(0, height)
    ctx.closePath()
    ctx.fillStyle = COLORS.white
    ctx.fill()
    ctx.globalAlpha = 1.0

    // Logo
    const logoHeight = 100
    drawLogo(ctx, 50, height / 2 - logoHeight / 2, logoHeight)

    // Text
    const logoWidth = logoHeight * (logoImage ? logoImage.width / logoImage.height : 2)
    ctx.fillStyle = COLORS.white
    ctx.font = 'bold 56px Inter, sans-serif'
    ctx.textAlign = 'left'
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
    ctx.shadowBlur = 8
    ctx.fillText('Navigate the AI Frontier', logoWidth + 80, height / 2 - 8)

    ctx.font = '26px Inter, sans-serif'
    ctx.fillText('Your Expert AI Tool Companion', logoWidth + 80, height / 2 + 32)
    ctx.shadowBlur = 0
  }

  const generateImage = (imageId: string) => {
    const canvas = canvasRefs.current.get(imageId)
    if (!canvas) return

    switch (imageId) {
      case 'og-default':
        generateOGDefault(canvas)
        break
      case 'og-home':
        generateOGHome(canvas)
        break
      case 'og-categories':
        generateOGCategories(canvas)
        break
      case 'og-rankings':
        generateOGRankings(canvas)
        break
      case 'twitter-image':
        generateTwitterImage(canvas)
        break
      case 'twitter-summary':
        generateTwitterSummary(canvas)
        break
      case 'brand-banner':
        generateBrandBanner(canvas)
        break
      default:
        generateOGDefault(canvas)
    }

    // Convert canvas to data URL
    const dataUrl = canvas.toDataURL('image/png')
    setGeneratedImages(prev => new Map(prev).set(imageId, dataUrl))
  }

  const downloadImage = (imageId: string, imageName: string) => {
    const dataUrl = generatedImages.get(imageId)
    if (!dataUrl) return

    const link = document.createElement('a')
    link.download = `${imageName}.png`
    link.href = dataUrl
    link.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <ImageIcon className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
                OG Image Generator
                <Badge className="bg-magellan-gold/20 text-magellan-gold border-magellan-gold/30">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Professional
                </Badge>
              </h1>
              <p className="text-muted-foreground mt-1">
                Generate beautiful social media share images for AI Magellan
              </p>
            </div>
          </div>

          <Card className="border-l-4 border-l-primary bg-primary/5">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Compass className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">How to use</h3>
                  <p className="text-sm text-muted-foreground">
                    All images are generated automatically with the AI Magellan logo and brand colors.
                    Click the download button on any image to save it to your device.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <RefreshCw className="h-12 w-12 text-primary animate-spin mx-auto" />
              <p className="text-muted-foreground">Loading logo and generating images...</p>
            </div>
          </div>
        )}

        {/* Images Grid */}
        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {OG_IMAGES.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-2 hover:border-primary/30">
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-magellan-teal/10">
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Ship className="h-5 w-5 text-primary" />
                        {image.name}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {image.width} × {image.height}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {image.description}
                    </p>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="relative bg-neutral">
                      <canvas
                        ref={el => {
                          if (el) canvasRefs.current.set(image.id, el)
                        }}
                        width={image.width}
                        height={image.height}
                        className="w-full h-auto"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                    </div>
                    <div className="p-4 bg-muted/30 flex gap-2">
                      <Button
                        onClick={() => downloadImage(image.id, image.name)}
                        className="flex-1 bg-primary hover:bg-primary/90"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        onClick={() => generateImage(image.id)}
                        variant="outline"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <Card className="bg-gradient-to-r from-magellan-navy/5 to-magellan-teal/5 border-2">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-magellan-teal/20">
                  <Waves className="h-6 w-6 text-magellan-teal" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Telescope className="h-4 w-4" />
                    About these images
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    These images are designed using the Atlassian Design System and AI Magellan's ocean theme.
                    They feature professional gradients, the official logo, and brand colors optimized for
                    social media platforms like Facebook, Twitter, and LinkedIn.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
