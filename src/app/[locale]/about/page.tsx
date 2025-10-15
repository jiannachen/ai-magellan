"use client";

import { Card, CardContent } from "@/ui/common/card";
import {
  Compass,
  Anchor,
  Map,
  Telescope,
  Star,
  Navigation,
  Ship,
  Gem,
  ExternalLink,
  MessageSquare,
  Users,
} from "lucide-react";
import { Button } from "@/ui/common/button";
import FeedbackDialog from "@/components/feedback/feedback-dialog";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from 'next-intl';
import { cn } from "@/lib/utils/utils";

export default function AboutPage() {
  const t = useTranslations();

  const navigationFeatures = [
    {
      icon: <Telescope className="h-5 w-5" />,
      title: t('pages.about.features.discover.title'),
      description: t('pages.about.features.discover.description'),
    },
    {
      icon: <Gem className="h-5 w-5" />,
      title: t('pages.about.features.collect.title'), 
      description: t('pages.about.features.collect.description'),
    },
    {
      icon: <Map className="h-5 w-5" />,
      title: t('pages.about.features.rankings.title'),
      description: t('pages.about.features.rankings.description'),
    },
    {
      icon: <Compass className="h-5 w-5" />,
      title: t('pages.about.features.search.title'),
      description: t('pages.about.features.search.description'),
    },
  ];

  const explorationSteps = [
    {
      icon: <Ship className="h-4 w-4" />,
      title: t('pages.about.journey.submit.title'),
      description: t('pages.about.journey.submit.description'),
      action: (
        <Link href="/submit">
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "mt-3 group border-magellan-coral/30 hover:border-magellan-coral",
              "hover:bg-magellan-coral/5 transition-all duration-300"
            )}
          >
            <Anchor className="h-3 w-3 mr-2 text-magellan-coral" />
            {t('pages.about.journey.submit.button')}
          </Button>
        </Link>
      ),
    },
    {
      icon: <Navigation className="h-4 w-4" />,
      title: t('pages.about.journey.explore.title'),
      description: t('pages.about.journey.explore.description'),
      action: (
        <Link href="/">
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "mt-3 group border-magellan-teal/30 hover:border-magellan-teal",
              "hover:bg-magellan-teal/5 transition-all duration-300"
            )}
          >
            <Compass className="h-3 w-3 mr-2 text-magellan-teal" />
            {t('pages.about.journey.explore.button')}
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background relative">
      {/* 航海主题背景装饰 - 按照AM.md专业级标准优化为6-8%透明度 */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-gradient-to-br from-primary/8 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-gradient-to-tl from-magellan-coral/6 to-transparent rounded-full blur-2xl"></div>
      </div>

      {/* Hero Section - 航海出发点 */}
      <section className="relative overflow-hidden border-b border-primary/10">
        <div className="container px-4 py-20 mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.15, 1, 0.3, 1] }}
            className="relative inline-flex flex-col items-center"
          >
            {/* 航海罗盘 */}
            <div className="relative mb-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="relative"
              >
                <Compass className="h-16 w-16 text-primary opacity-80" />
              </motion.div>
              <div className="absolute inset-0 bg-primary/15 blur-xl -z-10 animate-pulse [animation-duration:4s]" />
            </div>
            
            {/* 标题区域 */}
            <div className="space-y-6 max-w-4xl">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className={cn(
                  "text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight",
                  "bg-gradient-to-br from-primary via-magellan-teal to-magellan-coral bg-clip-text text-transparent"
                )}
              >
                {t('pages.about.hero.title')}
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-lg sm:text-xl text-muted-foreground/90 max-w-3xl mx-auto leading-relaxed"
              >
                {t('pages.about.hero.subtitle')}
              </motion.p>
            </div>
          </motion.div>
        </div>
        
        {/* 装饰性波浪线 */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
      </section>

      {/* Mission Section - 航海使命 */}
      <section className="container px-4 py-16 mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Anchor className="h-8 w-8 text-magellan-coral" />
              <div className="absolute inset-0 bg-magellan-coral/20 blur-lg -z-10"></div>
            </div>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-foreground">
            {t('pages.about.mission.title')}
          </h2>
          <p className="text-lg text-muted-foreground/90 leading-relaxed">
            {t('pages.about.mission.description')}
          </p>
        </motion.div>
      </section>

      {/* Features Section - 导航功能 */}
      <section className="container px-4 py-16 mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">
            {t('pages.about.features.title')}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {navigationFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className="h-full"
            >
              <Card
                className={cn(
                  "group relative overflow-hidden backdrop-blur-sm",
                  "border-border/30 bg-background/30 hover:shadow-lg",
                  "transition-all duration-500 hover:-translate-y-1 h-full flex flex-col"
                )}
              >
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="text-center flex-grow flex flex-col">
                    <div className="inline-flex p-3 rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary/15 transition-colors duration-300 mx-auto">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold mb-3 group-hover:text-primary transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground/80 group-hover:text-muted-foreground transition-colors duration-300 flex-grow">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Journey Section - 探索之旅 */}
      <section className="container px-4 py-16 mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">
            {t('pages.about.journey.title')}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {explorationSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              className="h-full"
            >
              <Card
                className={cn(
                  "group relative p-6 border-border/30 bg-background/30 backdrop-blur-sm",
                  "hover:shadow-lg transition-all duration-500 h-full flex flex-col min-h-[240px]"
                )}
              >
                <div className="flex items-start gap-4 mb-6 flex-1">
                  <div className="flex-shrink-0 relative flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors duration-300">
                    {step.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold group-hover:text-primary transition-colors duration-300 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground/80 group-hover:text-muted-foreground transition-colors duration-300">
                      {step.description}
                    </p>
                  </div>
                </div>
                <div className="pl-14">{step.action}</div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Community Section - 加入探险队 */}
      <section className="container px-4 py-20 mx-auto text-center border-t border-primary/10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Star className="h-8 w-8 text-magellan-gold" />
              <div className="absolute inset-0 bg-magellan-gold/20 blur-lg -z-10"></div>
            </div>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-foreground">
            {t('pages.about.community.title')}
          </h2>
          <p className="text-lg text-muted-foreground/90 leading-relaxed mb-8">
            {t('pages.about.community.description')}
          </p>
          
          {/* 参与按钮组 */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {/* 反馈触发按钮 */}
            <FeedbackDialog
              trigger={
                <Button
                  variant="outline"
                  className={cn(
                    "group border-magellan-coral/30 hover:border-magellan-coral",
                    "hover:bg-magellan-coral/5 transition-all duration-300"
                  )}
                >
                  <MessageSquare className="h-4 w-4 mr-2 text-magellan-coral" />
                  {t('pages.about.community.feedback')}
                </Button>
              }
            />
            
            <Button
              asChild
              variant="outline"
              className={cn(
                "group border-magellan-teal/30 hover:border-magellan-teal", 
                "hover:bg-magellan-teal/5 transition-all duration-300"
              )}
            >
              <a href="https://discord.gg/vC4zmKypbK" target="_blank" rel="noopener noreferrer">
                <Users className="h-4 w-4 mr-2 text-magellan-teal" />
                {t('pages.about.community.discord')}
              </a>
            </Button>
            
            <Button
              asChild
              variant="outline"
              className={cn(
                "group border-magellan-gold/30 hover:border-magellan-gold",
                "hover:bg-magellan-gold/5 transition-all duration-300"
              )}
            >
              <a href="https://x.com/SuitaoC40798" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2 text-magellan-gold" />
                {t('pages.about.community.twitter')}
              </a>
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
