"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Crown, 
  Shield, 
  Eye, 
  MoreHorizontal,
  Search,
  Filter
} from "lucide-react";
import { Badge } from "@/ui/common/badge";
import { Button } from "@/ui/common/button";
import { Input } from "@/ui/common/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/common/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/common/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/ui/common/dropdown-menu";
import { UserDetailModal } from "./user-detail-modal";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils/utils";

interface User {
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
}

interface UserManagementClientProps {
  initialUsers: User[];
}

export function UserManagementClient({ initialUsers }: UserManagementClientProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const { toast } = useToast();

  // 过滤用户
  const filterUsers = () => {
    let filtered = users.filter(user => {
      const matchesSearch = 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus = statusFilter === "all" || user.status === statusFilter;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
    
    setFilteredUsers(filtered);
  };

  // 当搜索或过滤条件改变时更新结果
  useEffect(() => {
    filterUsers();
  }, [searchTerm, roleFilter, statusFilter, users]);

  // 获取角色显示信息
  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'admin':
        return { 
          label: '管理员', 
          icon: Crown, 
          variant: 'default' as const,
          className: 'bg-red-50 text-red-700 border-red-200'
        };
      case 'moderator':
        return { 
          label: '审核员', 
          icon: Shield, 
          variant: 'secondary' as const,
          className: 'bg-blue-50 text-blue-700 border-blue-200'
        };
      default:
        return { 
          label: '用户', 
          icon: Users, 
          variant: 'outline' as const,
          className: 'bg-gray-50 text-gray-700 border-gray-200'
        };
    }
  };

  // 获取状态显示信息
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return { 
          label: '正常', 
          className: 'bg-green-50 text-green-700 border-green-200'
        };
      case 'banned':
        return { 
          label: '封禁', 
          className: 'bg-red-50 text-red-700 border-red-200'
        };
      case 'suspended':
        return { 
          label: '暂停', 
          className: 'bg-yellow-50 text-yellow-700 border-yellow-200'
        };
      default:
        return { 
          label: '未知', 
          className: 'bg-gray-50 text-gray-700 border-gray-200'
        };
    }
  };

  // 更新用户
  const updateUser = async (userId: string, updates: { role?: string; status?: string }) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      const result = await response.json();
      
      if (result.success) {
        // 更新本地状态
        setUsers(prev => prev.map(user => 
          user.id === userId 
            ? { ...user, ...updates, updatedAt: new Date().toISOString() }
            : user
        ));
        
        toast({
          title: "更新成功",
          description: "用户信息已更新",
        });
      } else {
        throw new Error(result.message || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "更新失败",
        description: "无法更新用户信息，请重试",
        variant: "destructive",
      });
    }
  };

  // 查看用户详情
  const viewUserDetail = (user: User) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary/15 to-blue-500/10 border border-primary/20 shadow-lg">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">用户管理</h1>
            <p className="text-sm text-muted-foreground mt-1">
              管理用户账户、角色权限和提交内容
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 bg-background/50 p-4 rounded-xl border border-border/40">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索用户名或邮箱..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="角色筛选" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有角色</SelectItem>
              <SelectItem value="user">用户</SelectItem>
              <SelectItem value="moderator">审核员</SelectItem>
              <SelectItem value="admin">管理员</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="状态筛选" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有状态</SelectItem>
              <SelectItem value="active">正常</SelectItem>
              <SelectItem value="suspended">暂停</SelectItem>
              <SelectItem value="banned">封禁</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-border/40 bg-background/30 shadow-sm overflow-hidden backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/40 bg-background/20">
              <TableHead>用户</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>提交数量</TableHead>
              <TableHead>注册时间</TableHead>
              <TableHead className="w-24">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {filteredUsers.map((user, index) => {
                const roleInfo = getRoleInfo(user.role);
                const statusInfo = getStatusInfo(user.status);
                
                return (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="border-b border-border/20 hover:bg-background/40 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.name || 'User'}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-4 w-4 text-primary" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-foreground">
                            {user.name || '未设置姓名'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge 
                        variant={roleInfo.variant}
                        className={cn("gap-1", roleInfo.className)}
                      >
                        <roleInfo.icon className="h-3 w-3" />
                        {roleInfo.label}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={statusInfo.className}
                      >
                        {statusInfo.label}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">
                          {user._count.websites} 个网站
                        </div>
                        <div className="text-muted-foreground">
                          {user._count.likes} 点赞 · {user._count.favorites} 收藏
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewUserDetail(user)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => viewUserDetail(user)}>
                              <Eye className="h-4 w-4 mr-2" />
                              查看详情
                            </DropdownMenuItem>
                            
                            {user.role !== 'admin' && (
                              <>
                                {user.role === 'user' && (
                                  <DropdownMenuItem 
                                    onClick={() => updateUser(user.id, { role: 'moderator' })}
                                  >
                                    <Shield className="h-4 w-4 mr-2" />
                                    设为审核员
                                  </DropdownMenuItem>
                                )}
                                
                                {user.role === 'moderator' && (
                                  <DropdownMenuItem 
                                    onClick={() => updateUser(user.id, { role: 'user' })}
                                  >
                                    <Users className="h-4 w-4 mr-2" />
                                    设为普通用户
                                  </DropdownMenuItem>
                                )}
                                
                                {user.status === 'active' ? (
                                  <DropdownMenuItem 
                                    onClick={() => updateUser(user.id, { status: 'banned' })}
                                    className="text-red-600"
                                  >
                                    <UserX className="h-4 w-4 mr-2" />
                                    封禁用户
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem 
                                    onClick={() => updateUser(user.id, { status: 'active' })}
                                    className="text-green-600"
                                  >
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    解除封禁
                                  </DropdownMenuItem>
                                )}
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </TableBody>
        </Table>
        
        {filteredUsers.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>没有找到匹配的用户</p>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      <UserDetailModal
        user={selectedUser}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedUser(null);
        }}
      />
    </div>
  );
}