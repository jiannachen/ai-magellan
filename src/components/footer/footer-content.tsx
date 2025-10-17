"use client";

import { useState, useEffect } from "react";
import { useAtom } from "jotai";
import { motion } from "framer-motion";
import { Button } from "@/ui/common/button";
import { Plus, Compass, Anchor, Map, Route, Star, TrendingUp, Shield, Info, FileText, ExternalLink, Copyright, Heart, Zap, Github } from "lucide-react";
import { isAdminModeAtom, footerSettingsAtom } from "@/lib/atoms";
import { useTranslations, useLocale } from 'next-intl';
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/ui/common/dialog";
import { Input } from "@/ui/common/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils/utils";
import type { FooterSettings } from "@/lib/types";

export default function FooterContent({
  initialSettings,
}: {
  initialSettings: FooterSettings;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const [isAdmin] = useAtom(isAdminModeAtom);
  const [settings, setSettings] = useAtom(footerSettingsAtom);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newLink, setNewLink] = useState({ title: "", url: "" });
  const { toast } = useToast();

  // Helper function to construct proper locale paths
  const getLocalizedPath = (path: string) => {
    return locale === 'en' ? path : `/${locale}${path}`;
  };

  // Initialize settings
  useEffect(() => {
    setSettings({
      copyright: initialSettings.copyright || "",
      icpBeian: initialSettings.icpBeian || "",
      links:
        initialSettings.links?.map((link) => ({
          title: link.title,
          url: link.url,
        })) || [],
      customHtml: initialSettings.customHtml || "",
    });
  }, [initialSettings, setSettings]);

  const handleAddLink = async () => {
    if (!newLink.title || !newLink.url) {
      toast({
        title: t('common.error'),
        description: t('footer.messages.complete_info_required'),
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/footer-links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newLink),
      });

      if (!response.ok) throw new Error("Failed to add link");

      setSettings((prev) => ({
        ...prev,
        links: [...prev.links, { title: newLink.title, url: newLink.url }],
      }));

      setNewLink({ title: "", url: "" });
      setIsDialogOpen(false);

      toast({
        title: t('common.success'),
        description: t('footer.messages.link_added_success'),
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('footer.messages.link_add_error'),
        variant: "destructive",
      });
    }
  };

  const handleRemoveLink = async (index: number) => {
    try {
      const response = await fetch(`/api/footer-links?id=${index}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to remove link");

      setSettings((prev) => ({
        ...prev,
        links: prev.links.filter((_, i) => i !== index),
      }));

      toast({
        title: t('common.success'),
        description: t('footer.messages.link_deleted_success'),
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('footer.messages.link_delete_error'),
        variant: "destructive",
      });
    }
  };

  // 快速链接数据 - 航海主题
  const quickLinks = [
    { href: "/", label: t('navigation.home'), icon: Compass },
    { href: "/categories", label: t('navigation.categories'), icon: Map },
    { href: "/submit", label: t('navigation.submit'), icon: Anchor },
  ];

  // 排行榜链接数据 - 探索航线
  const rankingLinks = [
    { href: "/rankings", label: t('footer.rankings.all_rankings'), icon: Route },
    { href: "/rankings/popular", label: t('footer.rankings.most_popular'), icon: Heart },
    { href: "/rankings/top-rated", label: t('footer.rankings.top_rated'), icon: Star },
    { href: "/rankings/trending", label: t('footer.rankings.trending'), icon: TrendingUp },
    { href: "/rankings/free", label: t('footer.rankings.best_free'), icon: Shield },
  ];

  return (
    <motion.footer
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.15, 1, 0.3, 1] }}
      className={cn(
        "w-full relative",
        "bg-gradient-to-br from-primary/3 via-background to-magellan-teal/2",
        "border-t border-primary/20"
      )}
    >
      {/* 航海主题背景装饰 - 按照AM.md专业级标准优化为6-8%透明度 */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-primary/8 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-tl from-magellan-coral/6 to-transparent rounded-full blur-2xl"></div>
      </div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* AI Magellan 品牌区 */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="relative">
                <img src="/logo.png" alt="AI Magellan Logo" className="h-8 w-8 rounded-lg" />
                <div className="absolute inset-0 rounded-full border-2 border-primary/20"></div>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl bg-gradient-to-r from-primary to-magellan-teal bg-clip-text text-transparent">
                  AI Magellan
                </span>
                <span className="text-xs text-muted-foreground">
                  🧭 {t('footer.brand.tagline')}
                </span>
              </div>
            </motion.div>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-sm text-muted-foreground leading-relaxed"
            >
              🌊 {t('footer.description')}
              <br />
              <span className="text-primary font-medium">{t('footer.brand.subtitle')}</span>
            </motion.p>
            
            {/* 航海统计 */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex gap-4 text-xs text-muted-foreground"
            >
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                <span>1000+ Islands</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-magellan-teal animate-pulse"></div>
                <span>50+ Territories</span>
              </div>
            </motion.div>
          </div>

          {/* 导航航线 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              🗺️ {t('footer.sections.navigation_routes')}
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <motion.li 
                  key={link.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                >
                  <Link
                    href={getLocalizedPath(link.href)}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-300"
                  >
                    <link.icon className="h-3 w-3" />
                    {link.label}
                  </Link>
                </motion.li>
              ))}
              <motion.li
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <Link
                  href={getLocalizedPath("/about")}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-300"
                >
                  <Info className="h-3 w-3" />
                  {t('navigation.about')}
                </Link>
              </motion.li>
            </ul>
          </motion.div>

          {/* 探索排行榜 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-6"
          >
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              🏆 {t('footer.sections.expedition_rankings')}
            </h3>
            <ul className="space-y-3">
              {rankingLinks.map((link, index) => (
                <motion.li 
                  key={link.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                >
                  <Link
                    href={getLocalizedPath(link.href)}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-magellan-gold transition-colors duration-300"
                  >
                    <link.icon className="h-3 w-3" />
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* 探索支援 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                ⚓ {t('footer.sections.expedition_support')}
              </h3>
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-6 w-6 p-0 rounded-full",
                    "hover:bg-magellan-coral/10 hover:text-magellan-coral",
                    "subtle-hover"
                  )}
                  onClick={() => setIsDialogOpen(true)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              )}
            </div>
            <ul className="space-y-3">
              {settings.links.map((link, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  className="flex items-center gap-2"
                >
                  <Link
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-magellan-coral transition-colors duration-300 flex-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {link.title}
                  </Link>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
                      onClick={() => handleRemoveLink(index)}
                    >
                      ×
                    </Button>
                  )}
                </motion.li>
              ))}

              {/* 法律信息 - 按照AM.md专业级标准优化 */}
              <motion.li
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                <Link
                  href={getLocalizedPath("/privacy-policy")}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-300"
                >
                  <Shield className="h-3 w-3" />
                  {t('footer.legal.privacy')}
                </Link>
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
              >
                <Link
                  href={getLocalizedPath("/terms-of-service")}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-300"
                >
                  <FileText className="h-3 w-3" />
                  {t('footer.legal.terms')}
                </Link>
              </motion.li>
              {settings.icpBeian && (
                <motion.li
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.7 }}
                >
                  <a
                    href="https://beian.miit.gov.cn/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-300"
                  >
                    <FileText className="h-3 w-3" />
                    {settings.icpBeian}
                  </a>
                </motion.li>
              )}
            </ul>
          </motion.div>
        </div>

        {/* 底部航海线和版权信息 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="relative"
        >
          {/* 装饰性航海线 */}
          <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent mb-6"></div>
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Copyright className="h-3 w-3" />
              © {new Date().getFullYear()} AI Magellan. {t('footer.copyright')}
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Info className="h-3 w-3" />
              {t('footer.site_info')}
            </div>
          </div>
        </motion.div>

        {/* 自定义HTML */}
        {settings.customHtml && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-6 text-xs text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: settings.customHtml }}
          />
        )}
      </div>

      {/* 添加链接对话框 - 航海主题 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className={cn(
          "bg-background/95 backdrop-blur-xl border border-primary/20",
          "rounded-2xl shadow-2xl"
        )}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Anchor className="h-5 w-5 text-magellan-coral" />
              ⚓ {t('footer.dialog.add_link_title')}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              🌊 {t('footer.dialog.add_link_description')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Map className="h-3 w-3 text-primary" />
                {t('footer.dialog.link_name_label')}
              </label>
              <Input
                value={newLink.title}
                onChange={(e) =>
                  setNewLink((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder={t('footer.dialog.link_name_placeholder')}
                className="border-primary/20 focus:border-primary rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Route className="h-3 w-3 text-magellan-teal" />
                {t('footer.dialog.link_address_label')}
              </label>
              <Input
                value={newLink.url}
                onChange={(e) =>
                  setNewLink((prev) => ({ ...prev, url: e.target.value }))
                }
                placeholder={t('footer.dialog.link_address_placeholder')}
                className="border-primary/20 focus:border-primary rounded-xl"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-primary/30 hover:bg-primary/5 rounded-xl"
              >
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleAddLink}
                className={cn(
                  "bg-gradient-to-r from-magellan-coral to-magellan-gold",
                  "hover:from-magellan-coral/90 hover:to-magellan-gold/90",
                  "text-white rounded-xl"
                )}
              >
                <Anchor className="h-4 w-4 mr-2" />
                {t('footer.dialog.add_button')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.footer>
  );
}