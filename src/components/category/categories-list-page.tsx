"use client";

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/ui/common/card';
import { Badge } from '@/ui/common/badge';
import { Button } from '@/ui/common/button';
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
      {/* Header */}
      <section className="py-16 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Browse AI Tools by{" "}
              <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Category
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Find the perfect AI tool for your specific needs. Explore our curated categories with top-rated tools.
            </p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-12 flex justify-center gap-8 text-sm text-muted-foreground"
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

      {/* Categories Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {categories.map((category, index) => {
              const IconComponent = categoryIcons[category.slug as keyof typeof categoryIcons] || Brain;
              
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group border-2 border-transparent hover:border-primary/20">
                    <CardContent className="p-8">
                      {/* Category Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/10 to-purple-500/10 group-hover:from-primary/20 group-hover:to-purple-500/20 transition-all duration-300">
                            <IconComponent className="h-8 w-8 text-primary" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold">{category.name}</h2>
                            <p className="text-muted-foreground">
                              {category.toolCount} tools available
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-sm">
                          {category.toolCount}
                        </Badge>
                      </div>

                      {/* Featured Tools Preview */}
                      {category.featuredTools.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                            Featured Tools
                          </h3>
                          <div className="space-y-3">
                            {category.featuredTools.map((tool) => (
                              <div key={tool.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                {tool.thumbnail ? (
                                  <img 
                                    src={tool.thumbnail} 
                                    alt={tool.title}
                                    className="w-8 h-8 rounded object-cover flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <IconComponent className="h-4 w-4 text-primary" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{tool.title}</p>
                                  {tool.tagline && (
                                    <p className="text-xs text-muted-foreground truncate">{tool.tagline}</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Star className="h-3 w-3" />
                                  <span>{tool.quality_score}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* CTA */}
                      <Link href={`/categories/${category.slug}`}>
                        <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                          Explore {category.name} Tools
                          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
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

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/5 to-purple-500/5">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-bold">
              Can't find the right category?
            </h2>
            <p className="text-xl text-muted-foreground">
              We're constantly adding new categories and tools. Submit your suggestion or tool!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/submit">
                <Button size="lg" className="w-full sm:w-auto">
                  Submit a Tool
                </Button>
              </Link>
              <Link href="/">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
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