"use client";

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/ui/common/card';
import { Badge } from '@/ui/common/badge';
import { Button } from '@/ui/common/button';
import { cn } from '@/lib/utils/utils';
import {
  Brain,
  Code,
  Image,
  PenTool,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Star,
  Users,
  Grid3X3
} from 'lucide-react';
import Link from 'next/link';

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

// Category icons mapping
const categoryIcons = {
  'ai-chat': MessageSquare,
  'ai-art': Image,
  'ai-writing': PenTool,
  'ai-coding': Code,
  'ai-tools': Brain,
  'llm': Sparkles,
};

export default function CategoriesListPage({ categories }: CategoriesListPageProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header - Atlassian风格 */}
      <section className="py-12 px-4 bg-primary/5"> {/* 减少垂直间距，使用简洁背景 */}
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.3,
              ease: [0.15, 1, 0.3, 1] // Atlassian entrance缓动
            }}
            className="space-y-4" // 减少间距
          >
            <h1 className={cn(
              "text-atlassian-display md:text-atlassian-display", // 使用Atlassian字体层级
              "font-medium tracking-tight"
            )}>
              Browse AI Tools by{" "}
              <span className="text-primary"> {/* 简化为单一主色调 */}
                Category
              </span>
            </h1>
            <p className="text-atlassian-body-large text-muted-foreground max-w-3xl mx-auto">
              Find the perfect AI tool for your specific needs. Explore our curated categories with top-rated tools.
            </p>
          </motion.div>

          {/* Quick Stats - Atlassian风格 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.3, 
              delay: 0.1,
              ease: [0.25, 0.1, 0.25, 1] // Atlassian standard缓动
            }}
            className="mt-8 flex justify-center gap-6 text-atlassian-body text-muted-foreground" // 减少间距，使用Atlassian字体
          >
            <div className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4" />
              <span>{categories.length} Categories</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span>{categories.reduce((sum, cat) => sum + cat.toolCount, 0)} Tools</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span>Quality Curated</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Grid - Atlassian风格 */}
      <section className="py-12 px-4"> {/* 减少垂直间距 */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* 减少grid间距 */}
            {categories.map((category, index) => {
              const IconComponent = categoryIcons[category.slug as keyof typeof categoryIcons] || Brain;
              
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: index * 0.05, // 减少延迟间隔
                    ease: [0.25, 0.1, 0.25, 1] // Atlassian standard缓动
                  }}
                >
                  <Card className={cn(
                    "h-full group",
                    "card-atlassian", // 使用Atlassian卡片样式
                    "border-border/60 hover:border-primary/30",
                    "transition-atlassian-standard"
                  )}>
                    <CardContent className="p-6"> {/* 减少内边距 */}
                      {/* Category Header - Atlassian风格 */}
                      <div className="flex items-center justify-between mb-5"> {/* 减少底部间距 */}
                        <div className="flex items-center gap-3"> {/* 减少gap */}
                          <div className={cn(
                            "p-2.5 rounded-lg", // 使用8px圆角，减少padding
                            "bg-primary/10 border border-primary/20",
                            "group-hover:bg-primary/15 transition-atlassian-standard"
                          )}>
                            <IconComponent className="h-6 w-6 text-primary" /> {/* 稍微减小图标 */}
                          </div>
                          <div>
                            <h2 className="text-atlassian-h4 font-medium">{category.name}</h2> {/* 使用Atlassian字体层级 */}
                            <p className="text-atlassian-body text-muted-foreground">
                              {category.toolCount} tools available
                            </p>
                          </div>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-atlassian-body-small",
                            "border-border/60 bg-background/80"
                          )}
                        >
                          {category.toolCount}
                        </Badge>
                      </div>

                      {/* Featured Tools Preview - Atlassian风格 */}
                      {category.featuredTools.length > 0 && (
                        <div className="mb-5"> {/* 减少底部间距 */}
                          <h3 className="text-atlassian-caption font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                            Featured Tools
                          </h3>
                          <div className="space-y-2"> {/* 减少间距 */}
                            {category.featuredTools.map((tool) => (
                              <div 
                                key={tool.id} 
                                className={cn(
                                  "flex items-center gap-3 p-3 rounded-md", // 使用4px圆角
                                  "bg-muted/20 hover:bg-muted/30 transition-atlassian-standard"
                                )}
                              >
                                {tool.thumbnail ? (
                                  <img 
                                    src={tool.thumbnail} 
                                    alt={tool.title}
                                    className="w-7 h-7 rounded object-cover flex-shrink-0" // 稍微减小尺寸
                                  />
                                ) : (
                                  <div className="w-7 h-7 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <IconComponent className="h-3.5 w-3.5 text-primary" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-atlassian-body font-medium truncate">{tool.title}</p>
                                  {tool.tagline && (
                                    <p className="text-atlassian-body-small text-muted-foreground truncate">{tool.tagline}</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 text-atlassian-caption text-muted-foreground">
                                  <Star className="h-3 w-3" />
                                  <span>{tool.quality_score}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* CTA - Atlassian风格 */}
                      <Link href={`/categories/${category.slug}`}>
                        <Button className={cn(
                          "w-full",
                          "btn-atlassian-primary",
                          "rounded-md",
                          "text-atlassian-body font-medium",
                          "group-hover:shadow-atlassian-200"
                        )}>
                          Explore {category.name} Tools
                          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-0.5 transition-transform duration-200" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section - Atlassian风格 */}
      <section className="py-16 px-4 bg-primary/5"> {/* 减少垂直间距，使用简洁背景 */}
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.3,
              ease: [0.15, 1, 0.3, 1] // Atlassian entrance缓动
            }}
            className="space-y-4" // 减少间距
          >
            <h2 className="text-atlassian-h2 font-medium"> {/* 使用Atlassian字体层级 */}
              Can't find the right category?
            </h2>
            <p className="text-atlassian-body-large text-muted-foreground">
              We're constantly adding new categories and tools. Submit your suggestion or tool!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center"> {/* 减少间距 */}
              <Link href="/submit">
                <Button 
                  size="lg" 
                  className={cn(
                    "w-full sm:w-auto",
                    "btn-atlassian-primary",
                    "rounded-md px-6 py-3",
                    "text-atlassian-body font-medium"
                  )}
                >
                  Submit a Tool
                </Button>
              </Link>
              <Link href="/">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className={cn(
                    "w-full sm:w-auto",
                    "btn-atlassian-secondary",
                    "rounded-md px-6 py-3",
                    "text-atlassian-body font-medium"
                  )}
                >
                  Back to Home
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}