"use client";

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/ui/common/card';
import { Badge } from '@/ui/common/badge';
import { Button } from '@/ui/common/button';
import { cn } from '@/lib/utils/utils';
import {
  Compass,
  Code,
  Image,
  PenTool,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Star,
  Users,
  Map,
  Route,
  Brain,
  Anchor,
  Eye,
  Crown
} from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface CategoriesListPageProps {
  categories: Array<{
    id: number;
    name: string;
    slug: string;
    toolCount: number;
    featuredTools: Array<{
      id: number;
      title: string;
      thumbnail: string | null;
      tagline: string | null;
      quality_score: number;
    }>;
  }>;
}

// Category icons mapping - 海域探索主题
const categoryIcons = {
  'ai-chat': MessageSquare,
  'ai-art': Image,
  'ai-writing': PenTool,
  'ai-coding': Code,
  'ai-tools': Compass,
  'llm': Sparkles,
};

// 海域主题颜色映射
const territoryColors = {
  'ai-chat': 'magellan-teal',
  'ai-art': 'magellan-coral',
  'ai-writing': 'magellan-mint', 
  'ai-coding': 'primary',
  'ai-tools': 'magellan-gold',
  'llm': 'magellan-navy',
};

export default function CategoriesListPage({ categories }: CategoriesListPageProps) {
  const tCat = useTranslations('pages.categories');
  
  const getCategoryDisplayName = (slug: string, name: string) => {
    try {
      return tCat(`names.${slug}`);
    } catch {
      return name;
    }
  };

  const getTerritoryColor = (slug: string) => {
    return territoryColors[slug as keyof typeof territoryColors] || 'primary';
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* 海域背景装饰 */}
      <div className="absolute inset-0 opacity-6 pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-primary/4 to-transparent rounded-full blur-3xl professional-float"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-tr from-magellan-teal/3 to-transparent rounded-full blur-2xl professional-decoration" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-magellan-coral/2 to-magellan-gold/2 rounded-full blur-3xl professional-decoration active" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Header - 海域探索主题 */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-magellan-teal/3">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.6,
              ease: [0.15, 1, 0.3, 1]
            }}
            className="space-y-8"
          >
            {/* 探索徽章 */}
            <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 to-magellan-teal/10 border border-primary/20 shadow-lg">
              <Map className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-primary">🗺️ Territory Explorer</span>
              <div className="w-2 h-2 rounded-full bg-magellan-coral professional-glow"></div>
            </div>

            <h1 className={cn(
              "text-5xl md:text-6xl lg:text-7xl font-bold leading-tight",
              "bg-gradient-to-r from-primary via-magellan-teal to-magellan-coral bg-clip-text text-transparent"
            )}>
              🌊 {tCat('header_title')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              ⚓ {tCat('header_subtitle')}
            </p>
          </motion.div>

          {/* 探索统计 - 航海数据 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.5, 
              delay: 0.3
            }}
            className="mt-12 flex justify-center gap-8 text-sm text-muted-foreground flex-wrap"
          >
            <div className="flex items-center gap-2 group">
              <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Map className="h-4 w-4 text-primary" />
              </div>
              <span className="font-medium">{categories.length} {tCat('stats_territories', { count: categories.length })}</span>
            </div>
            <div className="flex items-center gap-2 group">
              <div className="p-2 rounded-full bg-magellan-teal/10 group-hover:bg-magellan-teal/20 transition-colors">
                <Compass className="h-4 w-4 text-magellan-teal" />
              </div>
              <span className="font-medium">{categories.reduce((sum, cat) => sum + cat.toolCount, 0)}+ Tools Charted</span>
            </div>
            <div className="flex items-center gap-2 group">
              <div className="p-2 rounded-full bg-magellan-gold/10 group-hover:bg-magellan-gold/20 transition-colors">
                <Crown className="h-4 w-4 text-magellan-gold" />
              </div>
              <span className="font-medium">🏆 {tCat('stats_expert_guided')}</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 海域地图 - Territory Map */}
      <section className="py-20 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
              🗺️ AI Territory Map
            </h2>
            <p className="text-lg text-muted-foreground">
              Navigate through different AI territories and discover powerful tools
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {categories.map((category, index) => {
              const IconComponent = categoryIcons[category.slug as keyof typeof categoryIcons] || Brain;
              const territoryColor = getTerritoryColor(category.slug);
              
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 40, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: index * 0.1,
                    ease: [0.15, 1, 0.3, 1]
                  }}
                >
                  <Card className={cn(
                    "group h-full relative overflow-hidden cursor-pointer",
                    "bg-card/95 backdrop-blur-sm border border-primary/10",
                    "rounded-2xl shadow-lg hover:shadow-2xl",
                    "transition-all duration-500 ease-out",
                    "subtle-hover",
                    "hover:border-primary/30"
                  )}>
                    {/* 海域背景效果 */}
                    <div className={cn(
                      "absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500",
                      `bg-gradient-to-br from-${territoryColor}/3 via-transparent to-${territoryColor}/5`
                    )}></div>
                    
                    {/* 海域深度指示器 */}
                    <div className="absolute top-4 right-4 z-10">
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "bg-background/90 backdrop-blur-sm border",
                          `border-${territoryColor}/30 text-${territoryColor}`
                        )}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        {category.toolCount} Islands
                      </Badge>
                    </div>

                    <CardContent className="p-8 relative z-10">
                      {/* 海域标识 */}
                      <div className="flex items-center gap-4 mb-6">
                        <div className={cn(
                          "relative p-4 rounded-2xl",
                          `bg-${territoryColor}/15 border border-${territoryColor}/20`,
                          "subtle-scale",
                          "transition-all duration-500"
                        )}>
                          <IconComponent className={cn(
                            "h-8 w-8 transition-colors duration-300",
                            `text-${territoryColor} group-hover:text-${territoryColor}`
                          )} />
                          {/* 发光环效果 */}
                          <div className={cn(
                            "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                            `bg-gradient-to-br from-${territoryColor}/20 to-transparent`
                          )}></div>
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">
                            {getCategoryDisplayName(category.slug, category.name)}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            🏝️ {category.toolCount} tools mapped in this territory
                          </p>
                        </div>
                      </div>

                      {/* 旗舰工具预览 - Flagship Tools */}
                      {category.featuredTools.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide flex items-center gap-2">
                            <Star className="h-3 w-3 text-magellan-gold" />
                            🏆 {tCat('flagships_title')}
                          </h4>
                          <div className="space-y-3">
                            {category.featuredTools.slice(0, 3).map((tool) => (
                              <div 
                                key={tool.id} 
                                className={cn(
                                  "flex items-center gap-3 p-3 rounded-xl",
                                  "bg-background/50 hover:bg-background/80 backdrop-blur-sm",
                                  "border border-primary/10 hover:border-primary/20",
                                  "transition-all duration-300 group/tool"
                                )}
                              >
                                {tool.thumbnail ? (
                                  <img 
                                    src={tool.thumbnail} 
                                    alt={tool.title}
                                    className="w-8 h-8 rounded-lg object-cover flex-shrink-0 group-hover/tool:scale-110 transition-transform duration-300 professional-card"
                                  />
                                ) : (
                                  <div className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                                    `bg-${territoryColor}/10 group-hover/tool:scale-110 transition-transform duration-300 professional-card`
                                  )}>
                                    <IconComponent className={cn("h-4 w-4", `text-${territoryColor}`)} />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate group-hover/tool:text-primary transition-colors duration-300">
                                    {tool.title}
                                  </p>
                                  {tool.tagline && (
                                    <p className="text-xs text-muted-foreground truncate">{tool.tagline}</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-magellan-gold">
                                  <Star className="h-3 w-3 fill-current" />
                                  <span>{tool.quality_score}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 探索按钮 */}
                      <Link href={`/categories/${category.slug}`}>
                        <Button className={cn(
                          "w-full group/btn relative overflow-hidden",
                          `bg-gradient-to-r from-${territoryColor} to-${territoryColor}/80`,
                          `hover:from-${territoryColor}/90 hover:to-${territoryColor}/70`,
                          "text-white rounded-xl px-6 py-3 font-semibold",
                          "shadow-lg hover:shadow-xl",
                          "subtle-hover"
                        )}>
                          {/* 按钮背景效果 */}
                          <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                          
                          <div className="relative flex items-center justify-center gap-2">
                            <Compass className="h-4 w-4 group-hover/btn:rotate-45 transition-transform duration-300 professional-compass" />
                            ⚓ Explore Territory
                            <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                          </div>
                        </Button>
                      </Link>
                    </CardContent>

                    {/* 底部装饰线 */}
                    <div className={cn(
                      "absolute bottom-0 left-0 right-0 h-1 scale-x-0 group-hover:scale-x-100 transition-transform duration-500",
                      `bg-gradient-to-r from-transparent via-${territoryColor}/60 to-transparent`
                    )}></div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 号召行动区域 - 探索邀请 */}
      <section className="py-20 px-4 relative bg-gradient-to-br from-primary/5 via-background to-magellan-coral/3">
        {/* 背景装饰 */}
        <div className="absolute inset-0 opacity-25">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-primary/3 to-transparent"></div>
        </div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.6,
              ease: [0.15, 1, 0.3, 1]
            }}
            className="space-y-8"
          >
            <h2 className="text-4xl font-bold flex items-center justify-center gap-3">
              ⚓ {tCat('cta_title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              🌊 {tCat('cta_subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/submit">
                <Button 
                  size="lg" 
                  className={cn(
                    "group relative overflow-hidden",
                    "bg-gradient-to-r from-magellan-coral to-magellan-gold",
                    "hover:from-magellan-coral/90 hover:to-magellan-gold/90",
                    "text-white rounded-xl px-8 py-4 text-lg font-semibold",
                    "shadow-lg hover:shadow-xl",
                    "subtle-hover"
                  )}
                >
                  <div className="relative flex items-center gap-3">
                    <Anchor className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300 professional-float" />
                    🗺️ {tCat('cta_chart_new')}
                  </div>
                </Button>
              </Link>
              
              <Link href="/">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className={cn(
                    "group",
                    "border-2 border-primary/30 hover:border-primary/60",
                    "bg-background/80 hover:bg-primary/5 backdrop-blur-sm",
                    "rounded-xl px-8 py-4 text-lg font-semibold",
                    "shadow-lg hover:shadow-xl",
                    "subtle-hover"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Compass className="h-5 w-5 text-primary group-hover:rotate-45 transition-transform duration-500 professional-compass" />
                    🏠 {tCat('cta_return')}
                  </div>
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
