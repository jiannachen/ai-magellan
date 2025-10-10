'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { Button } from '@/ui/common/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/common/card'
import { Input } from '@/ui/common/input'
import { Textarea } from '@/ui/common/textarea'
import { Label } from '@/ui/common/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/common/select'
import { toast } from 'sonner'

interface Website {
  id: number
  title: string
  url: string
  description: string
  category_id: number
  thumbnail: string | null
  status: string
  submittedBy: string
}

interface Category {
  id: number
  name: string
  slug: string
}

export default function EditWebsitePage() {
  const { isLoaded, isSignedIn, user } = useUser()
  const router = useRouter()
  const params = useParams()
  const websiteId = params?.id as string

  const [website, setWebsite] = useState<Website | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    category_id: 0,
    thumbnail: ''
  })

  useEffect(() => {
    if (isLoaded && isSignedIn && websiteId) {
      fetchWebsite()
      fetchCategories()
    }
  }, [isLoaded, isSignedIn, websiteId])

  const fetchWebsite = async () => {
    try {
      const response = await fetch(`/api/websites/${websiteId}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('网站不存在')
          return
        }
        if (response.status === 403) {
          setError('您没有权限编辑此网站')
          return
        }
        throw new Error('获取网站信息失败')
      }

      const data = await response.json()
      const websiteData = data.data || data

      // 检查是否是当前用户提交的网站
      if (websiteData.submittedBy !== user?.id) {
        setError('您只能编辑自己提交的网站')
        return
      }

      setWebsite(websiteData)
      setFormData({
        title: websiteData.title,
        url: websiteData.url,
        description: websiteData.description,
        category_id: websiteData.category_id,
        thumbnail: websiteData.thumbnail || ''
      })
    } catch (error) {
      console.error('Error fetching website:', error)
      setError('获取网站信息失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.data || data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.url || !formData.category_id) {
      toast.error('请填写所有必填字段')
      return
    }

    setSaving(true)
    
    try {
      const response = await fetch(`/api/websites/${websiteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '更新失败')
      }

      toast.success('网站信息已更新')
      router.push('/profile/submissions')
    } catch (error) {
      console.error('Error updating website:', error)
      toast.error(error instanceof Error ? error.message : '更新失败')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>需要登录</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              请先登录以编辑网站信息。
            </p>
            <Link href="/auth/signin">
              <Button>立即登录</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="h-4 bg-muted rounded w-1/3"></div>
              <div className="h-10 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-1/3"></div>
              <div className="h-10 bg-muted rounded"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>错误</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive mb-4">{error}</p>
            <div className="flex gap-4">
              <Link href="/profile/submissions">
                <Button variant="outline">返回我的提交</Button>
              </Link>
              <Button onClick={() => window.location.reload()}>重试</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页面头部 */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/profile/submissions">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回我的提交
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">编辑网站</h1>
      </div>

      {/* 编辑表单 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl"
      >
        <Card>
          <CardHeader>
            <CardTitle>编辑网站信息</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">网站名称 *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="请输入网站名称"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">网站链接 *</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => handleInputChange('url', e.target.value)}
                  placeholder="https://example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">网站描述</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="请简要描述这个网站的功能和特点"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">分类 *</Label>
                <Select
                  value={formData.category_id.toString()}
                  onValueChange={(value) => handleInputChange('category_id', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail">缩略图链接</Label>
                <Input
                  id="thumbnail"
                  type="url"
                  value={formData.thumbnail}
                  onChange={(e) => handleInputChange('thumbnail', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                {formData.thumbnail && (
                  <div className="mt-2">
                    <img 
                      src={formData.thumbnail} 
                      alt="缩略图预览" 
                      className="w-20 h-20 object-cover rounded border"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      保存中...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      保存更改
                    </>
                  )}
                </Button>
                <Link href="/profile/submissions">
                  <Button type="button" variant="outline">
                    取消
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}