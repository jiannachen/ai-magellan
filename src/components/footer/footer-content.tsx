"use client";

import { useState, useEffect } from "react";
import { useAtom } from "jotai";
import { motion } from "framer-motion";
import { Button } from "@/ui/common/button";
import { Plus, Brain } from "lucide-react";
import { isAdminModeAtom, footerSettingsAtom } from "@/lib/atoms";
import { useTranslations } from 'next-intl';
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
  const [isAdmin] = useAtom(isAdminModeAtom);
  const [settings, setSettings] = useAtom(footerSettingsAtom);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newLink, setNewLink] = useState({ title: "", url: "" });
  const { toast } = useToast();

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

  // 快速链接数据
  const quickLinks = [
    { href: "/", label: t('navigation.home') },
    { href: "/categories", label: t('navigation.categories') },
    { href: "/submit", label: t('navigation.submit') },
  ];

  // 排行榜链接数据
  const rankingLinks = [
    { href: "/rankings", label: t('footer.rankings.all_rankings') },
    { href: "/rankings/popular", label: t('footer.rankings.most_popular') },
    { href: "/rankings/top-rated", label: t('footer.rankings.top_rated') },
    { href: "/rankings/trending", label: t('footer.rankings.trending') },
    { href: "/rankings/free", label: t('footer.rankings.best_free') },
  ];

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "w-full border-t border-border",
        "bg-background/95 backdrop-blur-sm",
        "transition-colors duration-300"
      )}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* 网站信息 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">AI Navigation</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('footer.description')}
            </p>
          </div>

          {/* 快速链接 */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">{t('footer.sections.quick_links')}</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/about"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('navigation.about')}
                </Link>
              </li>
            </ul>
          </div>

          {/* 排行榜链接 */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">{t('footer.sections.rankings')}</h3>
            <ul className="space-y-2">
              {rankingLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 实用链接 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{t('footer.sections.useful_links')}</h3>
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 rounded-full hover:bg-primary/10 hover:text-primary"
                  onClick={() => setIsDialogOpen(true)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              )}
            </div>
            <ul className="space-y-2">
              {settings.links.length > 0 ? (
                settings.links.map((link, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.title}
                    </a>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleRemoveLink(index)}
                      >
                        ×
                      </Button>
                    )}
                  </li>
                ))
              ) : (
                <li className="text-sm text-muted-foreground/60 italic">
                  {isAdmin ? t('footer.admin.add_link_tooltip') : t('footer.admin.no_links_message')}
                </li>
              )}
            </ul>
          </div>

          {/* 法律信息 */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">{t('footer.sections.legal_info')}</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('footer.legal.privacy')}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('footer.legal.terms')}
                </a>
              </li>
              {settings.icpBeian && (
                <li>
                  <a
                    href="https://beian.miit.gov.cn/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {settings.icpBeian}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* 底部版权信息 */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} AI Navigation. {t('footer.copyright')}
            </div>
            <div className="text-sm text-muted-foreground">
              {t('footer.site_info')}
            </div>
          </div>
        </div>

        {/* 自定义HTML */}
        {settings.customHtml && (
          <div
            className="mt-4 text-xs text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: settings.customHtml }}
          />
        )}
      </div>

      {/* 添加链接对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-background border-border">
          <DialogHeader>
            <DialogTitle>{t('footer.dialog.add_link_title')}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {t('footer.dialog.add_link_description')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {t('footer.dialog.link_name_label')}
              </label>
              <Input
                value={newLink.title}
                onChange={(e) =>
                  setNewLink((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder={t('footer.dialog.link_name_placeholder')}
                className="border-input"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {t('footer.dialog.link_address_label')}
              </label>
              <Input
                value={newLink.url}
                onChange={(e) =>
                  setNewLink((prev) => ({ ...prev, url: e.target.value }))
                }
                placeholder={t('footer.dialog.link_address_placeholder')}
                className="border-input"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-input hover:bg-accent hover:text-accent-foreground"
              >
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleAddLink}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {t('footer.dialog.add_button')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.footer>
  );
}