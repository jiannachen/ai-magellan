import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  experimental: {
    optimizeCss: true,
  },
  // 路由重定向配置
  async redirects() {
    return [
      {
        source: '/:locale/category/:slug',
        destination: '/:locale/categories/:slug',
        permanent: true, // 308 永久重定向
      },
      // 兼容不带 locale 的旧路由
      {
        source: '/category/:slug',
        destination: '/categories/:slug',
        permanent: true,
      },
    ];
  },
  // Webpack 配置优化
  webpack: (config, { webpack }) => {
    // 禁用大字符串序列化警告
    if (config.infrastructureLogging) {
      config.infrastructureLogging.level = 'error';
    } else {
      config.infrastructureLogging = { level: 'error' };
    }

    return config;
  },
  eslint: {
    // 在构建时忽略 ESLint 错误
    ignoreDuringBuilds: true,
  },
  typescript: {
    // TypeScript 检查仍然保持开启
    ignoreBuildErrors: false,
  },
  // 图片优化配置
  images: {
    formats: ['image/webp', 'image/avif'] as Array<'image/webp' | 'image/avif'>,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920], // 移动端优先
    imageSizes: [16, 32, 48, 64, 96, 128, 256], // 包含小尺寸图标
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30天缓存
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // 配置外部图片域名以启用优化
    remotePatterns: [
      {
        protocol: 'https' as const,
        hostname: 'icon.horse',
        pathname: '/icon/**',
      },
      {
        protocol: 'https' as const,
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'https' as const,
        hostname: '**.cloudinary.com',
      },
      {
        protocol: 'https' as const,
        hostname: '**.googleusercontent.com',
      },
      // 允许常见的 CDN 和图片托管服务
      {
        protocol: 'https' as const,
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https' as const,
        hostname: 'cdn.jsdelivr.net',
      },
      {
        protocol: 'https' as const,
        hostname: 'cdn.prod.website-files.com',
      },
      {
        protocol: 'https' as const,
        hostname: 'tubly.app',
      },
      {
        protocol: 'https' as const,
        hostname: 'www.mindplix.com',
      },
      {
        protocol: 'https' as const,
        hostname: '**', // Allow all other HTTPS domains as fallback
      },
    ],
  },
  // 移动端优化
  compress: true,
  poweredByHeader: false,
};

module.exports = withNextIntl(nextConfig);
