"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  User, 
  Globe, 
  Calendar, 
  MapPin, 
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/ui/common/dialog";
import { Badge } from "@/ui/common/badge";
import { Button } from "@/ui/common/button";
import { Separator } from "@/ui/common/separator";
import { cn } from "@/lib/utils/utils";

interface UserDetailModalProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    role: string;
    status: string;
    locale: string;
    createdAt: string;
    updatedAt: string;
    _count: {
      websites: number;
      likes: number;
      favorites: number;
      reviews: number;
    };
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

interface UserWebsite {
  id: number;
  title: string;
  url: string;
  status: string;
  createdAt: string;
  category: {
    name: string;
    slug: string;
  };
}

interface DetailedUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  status: string;
  locale: string;
  createdAt: string;
  updatedAt: string;
  websites: UserWebsite[];
  _count: {
    websites: number;
    likes: number;
    favorites: number;
    reviews: number;
  };
}

export function UserDetailModal({ user, isOpen, onClose }: UserDetailModalProps) {
  const [detailedUser, setDetailedUser] = useState<DetailedUser | null>(null);
  const [loading, setLoading] = useState(false);

  // 当用户信息变化时获取详细信息
  useEffect(() => {
    if (user && isOpen) {
      fetchUserDetail(user.id);
    }
  }, [user, isOpen]);

  const fetchUserDetail = async (userId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setDetailedUser(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching user detail:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取网站状态信息
  const getWebsiteStatusInfo = (status: string) => {
    switch (status) {
      case 'approved':
        return { 
          label: '已通过', 
          icon: CheckCircle,
          className: 'text-green-600 bg-green-50 border-green-200'
        };
      case 'pending':
        return { 
          label: '审核中', 
          icon: Clock,
          className: 'text-yellow-600 bg-yellow-50 border-yellow-200'
        };
      case 'rejected':
        return { 
          label: '已拒绝', 
          icon: XCircle,
          className: 'text-red-600 bg-red-50 border-red-200'
        };
      default:
        return { 
          label: '未知', 
          icon: AlertCircle,
          className: 'text-gray-600 bg-gray-50 border-gray-200'
        };
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name || 'User'}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
            )}
            <div>
              <div className="font-semibold text-lg">
                {user.name || '未设置姓名'}
              </div>
              <div className="text-sm text-muted-foreground font-normal">
                {user.email}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 用户基本信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium text-foreground flex items-center gap-2">
                  <User className="h-4 w-4" />
                  基本信息
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">用户ID：</span>
                    <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                      {user.id}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">角色：</span>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role === 'admin' ? '管理员' : user.role === 'moderator' ? '审核员' : '用户'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">状态：</span>
                    <Badge 
                      variant="outline"
                      className={cn(
                        user.status === 'active' ? 'text-green-600 border-green-200 bg-green-50' :
                        user.status === 'banned' ? 'text-red-600 border-red-200 bg-red-50' :
                        'text-yellow-600 border-yellow-200 bg-yellow-50'
                      )}
                    >
                      {user.status === 'active' ? '正常' : user.status === 'banned' ? '封禁' : '暂停'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">语言偏好：</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {user.locale === 'zh-CN' ? '中文' : user.locale}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">注册时间：</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* 活动统计 */}
              <div className="space-y-4">
                <h3 className="font-medium text-foreground flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  活动统计
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary/5 rounded-lg p-4 text-center">
                    <div className="text-2xl font-semibold text-primary">
                      {user._count.websites}
                    </div>
                    <div className="text-sm text-muted-foreground">提交网站</div>
                  </div>
                  
                  <div className="bg-green-500/5 rounded-lg p-4 text-center">
                    <div className="text-2xl font-semibold text-green-600">
                      {user._count.likes}
                    </div>
                    <div className="text-sm text-muted-foreground">点赞数</div>
                  </div>
                  
                  <div className="bg-blue-500/5 rounded-lg p-4 text-center">
                    <div className="text-2xl font-semibold text-blue-600">
                      {user._count.favorites}
                    </div>
                    <div className="text-sm text-muted-foreground">收藏数</div>
                  </div>
                  
                  <div className="bg-orange-500/5 rounded-lg p-4 text-center">
                    <div className="text-2xl font-semibold text-orange-600">
                      {user._count.reviews}
                    </div>
                    <div className="text-sm text-muted-foreground">评价数</div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* 提交的网站列表 */}
            <div className="space-y-4">
              <h3 className="font-medium text-foreground flex items-center gap-2">
                <Globe className="h-4 w-4" />
                提交的网站
                {detailedUser && (
                  <Badge variant="outline">
                    {detailedUser.websites.length} 个
                  </Badge>
                )}
              </h3>
              
              {detailedUser?.websites && detailedUser.websites.length > 0 ? (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {detailedUser.websites.map((website, index) => {
                    const statusInfo = getWebsiteStatusInfo(website.status);
                    
                    return (
                      <motion.div
                        key={website.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-background/50"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm truncate">
                              {website.title}
                            </h4>
                            <Badge 
                              variant="outline" 
                              className={cn("text-xs", statusInfo.className)}
                            >
                              <statusInfo.icon className="h-3 w-3 mr-1" />
                              {statusInfo.label}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {website.category.name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(website.createdAt).toLocaleDateString('zh-CN')}
                            </span>
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-shrink-0"
                          onClick={() => window.open(website.url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>该用户还没有提交任何网站</p>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}