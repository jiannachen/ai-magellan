import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// AI工具分类体系 - 基于当前主流AI工具类型
const categories = [
  // 1. 内容创作类 (Content Creation)
  {
    name: '内容创作',
    slug: 'content-creation',
    name_en: 'Content Creation',
    name_zh: '内容创作',
    sort_order: 1,
    children: [
      { name: 'AI写作助手', slug: 'ai-writing', name_en: 'AI Writing', name_zh: 'AI写作助手', sort_order: 1 },
      { name: '文案生成', slug: 'copywriting', name_en: 'Copywriting', name_zh: '文案生成', sort_order: 2 },
      { name: '博客文章', slug: 'blog-writing', name_en: 'Blog Writing', name_zh: '博客文章', sort_order: 3 },
      { name: '社交媒体内容', slug: 'social-media', name_en: 'Social Media Content', name_zh: '社交媒体内容', sort_order: 4 },
      { name: 'SEO优化', slug: 'seo-tools', name_en: 'SEO Tools', name_zh: 'SEO优化', sort_order: 5 },
      { name: '邮件营销', slug: 'email-marketing', name_en: 'Email Marketing', name_zh: '邮件营销', sort_order: 6 },
    ]
  },

  // 2. 图像与设计 (Image & Design)
  {
    name: '图像与设计',
    slug: 'image-design',
    name_en: 'Image & Design',
    name_zh: '图像与设计',
    sort_order: 2,
    children: [
      { name: 'AI绘画', slug: 'ai-art-generation', name_en: 'AI Art Generation', name_zh: 'AI绘画', sort_order: 1 },
      { name: '图像编辑', slug: 'image-editing', name_en: 'Image Editing', name_zh: '图像编辑', sort_order: 2 },
      { name: 'Logo设计', slug: 'logo-design', name_en: 'Logo Design', name_zh: 'Logo设计', sort_order: 3 },
      { name: '图像增强', slug: 'image-enhancement', name_en: 'Image Enhancement', name_zh: '图像增强', sort_order: 4 },
      { name: '背景移除', slug: 'background-removal', name_en: 'Background Removal', name_zh: '背景移除', sort_order: 5 },
      { name: 'UI/UX设计', slug: 'ui-ux-design', name_en: 'UI/UX Design', name_zh: 'UI/UX设计', sort_order: 6 },
      { name: '3D设计', slug: '3d-design', name_en: '3D Design', name_zh: '3D设计', sort_order: 7 },
    ]
  },

  // 3. 视频与音频 (Video & Audio)
  {
    name: '视频与音频',
    slug: 'video-audio',
    name_en: 'Video & Audio',
    name_zh: '视频与音频',
    sort_order: 3,
    children: [
      { name: 'AI视频生成', slug: 'video-generation', name_en: 'Video Generation', name_zh: 'AI视频生成', sort_order: 1 },
      { name: '视频编辑', slug: 'video-editing', name_en: 'Video Editing', name_zh: '视频编辑', sort_order: 2 },
      { name: '语音合成', slug: 'text-to-speech', name_en: 'Text-to-Speech', name_zh: '语音合成', sort_order: 3 },
      { name: '语音克隆', slug: 'voice-cloning', name_en: 'Voice Cloning', name_zh: '语音克隆', sort_order: 4 },
      { name: '音频编辑', slug: 'audio-editing', name_en: 'Audio Editing', name_zh: '音频编辑', sort_order: 5 },
      { name: '音乐生成', slug: 'music-generation', name_en: 'Music Generation', name_zh: '音乐生成', sort_order: 6 },
      { name: '字幕生成', slug: 'subtitle-generation', name_en: 'Subtitle Generation', name_zh: '字幕生成', sort_order: 7 },
    ]
  },

  // 4. 编程开发 (Development & Code)
  {
    name: '编程开发',
    slug: 'development-code',
    name_en: 'Development & Code',
    name_zh: '编程开发',
    sort_order: 4,
    children: [
      { name: 'AI编程助手', slug: 'code-assistant', name_en: 'Code Assistant', name_zh: 'AI编程助手', sort_order: 1 },
      { name: '代码生成', slug: 'code-generation', name_en: 'Code Generation', name_zh: '代码生成', sort_order: 2 },
      { name: '代码审查', slug: 'code-review', name_en: 'Code Review', name_zh: '代码审查', sort_order: 3 },
      { name: '测试自动化', slug: 'test-automation', name_en: 'Test Automation', name_zh: '测试自动化', sort_order: 4 },
      { name: 'API开发', slug: 'api-development', name_en: 'API Development', name_zh: 'API开发', sort_order: 5 },
      { name: '低代码/无代码', slug: 'low-code-no-code', name_en: 'Low-Code/No-Code', name_zh: '低代码/无代码', sort_order: 6 },
    ]
  },

  // 5. 聊天机器人 (Chatbots & Conversational AI)
  {
    name: '聊天机器人',
    slug: 'chatbots',
    name_en: 'Chatbots & Conversational AI',
    name_zh: '聊天机器人',
    sort_order: 5,
    children: [
      { name: '智能对话', slug: 'conversational-ai', name_en: 'Conversational AI', name_zh: '智能对话', sort_order: 1 },
      { name: '客服机器人', slug: 'customer-service', name_en: 'Customer Service Bots', name_zh: '客服机器人', sort_order: 2 },
      { name: '虚拟助手', slug: 'virtual-assistant', name_en: 'Virtual Assistant', name_zh: '虚拟助手', sort_order: 3 },
      { name: '聊天机器人平台', slug: 'chatbot-platforms', name_en: 'Chatbot Platforms', name_zh: '聊天机器人平台', sort_order: 4 },
    ]
  },

  // 6. 数据分析 (Data & Analytics)
  {
    name: '数据分析',
    slug: 'data-analytics',
    name_en: 'Data & Analytics',
    name_zh: '数据分析',
    sort_order: 6,
    children: [
      { name: '商业智能', slug: 'business-intelligence', name_en: 'Business Intelligence', name_zh: '商业智能', sort_order: 1 },
      { name: '数据可视化', slug: 'data-visualization', name_en: 'Data Visualization', name_zh: '数据可视化', sort_order: 2 },
      { name: '预测分析', slug: 'predictive-analytics', name_en: 'Predictive Analytics', name_zh: '预测分析', sort_order: 3 },
      { name: '数据挖掘', slug: 'data-mining', name_en: 'Data Mining', name_zh: '数据挖掘', sort_order: 4 },
      { name: 'SQL助手', slug: 'sql-assistant', name_en: 'SQL Assistant', name_zh: 'SQL助手', sort_order: 5 },
    ]
  },

  // 7. 营销与销售 (Marketing & Sales)
  {
    name: '营销与销售',
    slug: 'marketing-sales',
    name_en: 'Marketing & Sales',
    name_zh: '营销与销售',
    sort_order: 7,
    children: [
      { name: '市场研究', slug: 'market-research', name_en: 'Market Research', name_zh: '市场研究', sort_order: 1 },
      { name: '广告优化', slug: 'ad-optimization', name_en: 'Ad Optimization', name_zh: '广告优化', sort_order: 2 },
      { name: '销售自动化', slug: 'sales-automation', name_en: 'Sales Automation', name_zh: '销售自动化', sort_order: 3 },
      { name: 'CRM工具', slug: 'crm-tools', name_en: 'CRM Tools', name_zh: 'CRM工具', sort_order: 4 },
      { name: '个性化营销', slug: 'personalization', name_en: 'Personalization', name_zh: '个性化营销', sort_order: 5 },
    ]
  },

  // 8. 教育与学习 (Education & Learning)
  {
    name: '教育与学习',
    slug: 'education-learning',
    name_en: 'Education & Learning',
    name_zh: '教育与学习',
    sort_order: 8,
    children: [
      { name: '在线课程', slug: 'online-courses', name_en: 'Online Courses', name_zh: '在线课程', sort_order: 1 },
      { name: '语言学习', slug: 'language-learning', name_en: 'Language Learning', name_zh: '语言学习', sort_order: 2 },
      { name: '学习助手', slug: 'study-assistant', name_en: 'Study Assistant', name_zh: '学习助手', sort_order: 3 },
      { name: '作业辅导', slug: 'homework-helper', name_en: 'Homework Helper', name_zh: '作业辅导', sort_order: 4 },
      { name: '教学工具', slug: 'teaching-tools', name_en: 'Teaching Tools', name_zh: '教学工具', sort_order: 5 },
    ]
  },

  // 9. 翻译与本地化 (Translation & Localization)
  {
    name: '翻译与本地化',
    slug: 'translation',
    name_en: 'Translation & Localization',
    name_zh: '翻译与本地化',
    sort_order: 9,
    children: [
      { name: '机器翻译', slug: 'machine-translation', name_en: 'Machine Translation', name_zh: '机器翻译', sort_order: 1 },
      { name: '文档翻译', slug: 'document-translation', name_en: 'Document Translation', name_zh: '文档翻译', sort_order: 2 },
      { name: '实时翻译', slug: 'real-time-translation', name_en: 'Real-time Translation', name_zh: '实时翻译', sort_order: 3 },
      { name: '本地化工具', slug: 'localization-tools', name_en: 'Localization Tools', name_zh: '本地化工具', sort_order: 4 },
    ]
  },

  // 10. 搜索与研究 (Search & Research)
  {
    name: '搜索与研究',
    slug: 'search-research',
    name_en: 'Search & Research',
    name_zh: '搜索与研究',
    sort_order: 10,
    children: [
      { name: 'AI搜索引擎', slug: 'ai-search', name_en: 'AI Search Engine', name_zh: 'AI搜索引擎', sort_order: 1 },
      { name: '学术研究', slug: 'academic-research', name_en: 'Academic Research', name_zh: '学术研究', sort_order: 2 },
      { name: '知识管理', slug: 'knowledge-management', name_en: 'Knowledge Management', name_zh: '知识管理', sort_order: 3 },
      { name: '文献综述', slug: 'literature-review', name_en: 'Literature Review', name_zh: '文献综述', sort_order: 4 },
    ]
  },

  // 11. 生产力工具 (Productivity)
  {
    name: '生产力工具',
    slug: 'productivity',
    name_en: 'Productivity',
    name_zh: '生产力工具',
    sort_order: 11,
    children: [
      { name: '任务管理', slug: 'task-management', name_en: 'Task Management', name_zh: '任务管理', sort_order: 1 },
      { name: '会议助手', slug: 'meeting-assistant', name_en: 'Meeting Assistant', name_zh: '会议助手', sort_order: 2 },
      { name: '笔记工具', slug: 'note-taking', name_en: 'Note Taking', name_zh: '笔记工具', sort_order: 3 },
      { name: '日程管理', slug: 'scheduling', name_en: 'Scheduling', name_zh: '日程管理', sort_order: 4 },
      { name: '自动化工作流', slug: 'workflow-automation', name_en: 'Workflow Automation', name_zh: '自动化工作流', sort_order: 5 },
    ]
  },

  // 12. 人力资源 (Human Resources)
  {
    name: '人力资源',
    slug: 'human-resources',
    name_en: 'Human Resources',
    name_zh: '人力资源',
    sort_order: 12,
    children: [
      { name: '招聘工具', slug: 'recruitment', name_en: 'Recruitment', name_zh: '招聘工具', sort_order: 1 },
      { name: '简历筛选', slug: 'resume-screening', name_en: 'Resume Screening', name_zh: '简历筛选', sort_order: 2 },
      { name: '员工培训', slug: 'employee-training', name_en: 'Employee Training', name_zh: '员工培训', sort_order: 3 },
      { name: '绩效管理', slug: 'performance-management', name_en: 'Performance Management', name_zh: '绩效管理', sort_order: 4 },
    ]
  },

  // 13. 健康与医疗 (Healthcare)
  {
    name: '健康与医疗',
    slug: 'healthcare',
    name_en: 'Healthcare',
    name_zh: '健康与医疗',
    sort_order: 13,
    children: [
      { name: '医疗诊断', slug: 'medical-diagnosis', name_en: 'Medical Diagnosis', name_zh: '医疗诊断', sort_order: 1 },
      { name: '健康监测', slug: 'health-monitoring', name_en: 'Health Monitoring', name_zh: '健康监测', sort_order: 2 },
      { name: '心理健康', slug: 'mental-health', name_en: 'Mental Health', name_zh: '心理健康', sort_order: 3 },
      { name: '医学研究', slug: 'medical-research', name_en: 'Medical Research', name_zh: '医学研究', sort_order: 4 },
      { name: '健身指导', slug: 'fitness-coaching', name_en: 'Fitness Coaching', name_zh: '健身指导', sort_order: 5 },
    ]
  },

  // 14. 金融与法律 (Finance & Legal)
  {
    name: '金融与法律',
    slug: 'finance-legal',
    name_en: 'Finance & Legal',
    name_zh: '金融与法律',
    sort_order: 14,
    children: [
      { name: '财务分析', slug: 'financial-analysis', name_en: 'Financial Analysis', name_zh: '财务分析', sort_order: 1 },
      { name: '投资顾问', slug: 'investment-advisory', name_en: 'Investment Advisory', name_zh: '投资顾问', sort_order: 2 },
      { name: '风险管理', slug: 'risk-management', name_en: 'Risk Management', name_zh: '风险管理', sort_order: 3 },
      { name: '法律文书', slug: 'legal-documents', name_en: 'Legal Documents', name_zh: '法律文书', sort_order: 4 },
      { name: '合规检查', slug: 'compliance', name_en: 'Compliance', name_zh: '合规检查', sort_order: 5 },
    ]
  },

  // 15. 电子商务 (E-commerce)
  {
    name: '电子商务',
    slug: 'ecommerce',
    name_en: 'E-commerce',
    name_zh: '电子商务',
    sort_order: 15,
    children: [
      { name: '产品推荐', slug: 'product-recommendation', name_en: 'Product Recommendation', name_zh: '产品推荐', sort_order: 1 },
      { name: '价格优化', slug: 'pricing-optimization', name_en: 'Pricing Optimization', name_zh: '价格优化', sort_order: 2 },
      { name: '库存管理', slug: 'inventory-management', name_en: 'Inventory Management', name_zh: '库存管理', sort_order: 3 },
      { name: '客户洞察', slug: 'customer-insights', name_en: 'Customer Insights', name_zh: '客户洞察', sort_order: 4 },
    ]
  },

  // 16. 游戏与娱乐 (Gaming & Entertainment)
  {
    name: '游戏与娱乐',
    slug: 'gaming-entertainment',
    name_en: 'Gaming & Entertainment',
    name_zh: '游戏与娱乐',
    sort_order: 16,
    children: [
      { name: 'AI游戏', slug: 'ai-gaming', name_en: 'AI Gaming', name_zh: 'AI游戏', sort_order: 1 },
      { name: '游戏开发', slug: 'game-development', name_en: 'Game Development', name_zh: '游戏开发', sort_order: 2 },
      { name: '虚拟角色', slug: 'virtual-characters', name_en: 'Virtual Characters', name_zh: '虚拟角色', sort_order: 3 },
      { name: '互动娱乐', slug: 'interactive-entertainment', name_en: 'Interactive Entertainment', name_zh: '互动娱乐', sort_order: 4 },
    ]
  },

  // 17. 其他工具 (Other Tools)
  {
    name: '其他工具',
    slug: 'other-tools',
    name_en: 'Other Tools',
    name_zh: '其他工具',
    sort_order: 17,
    children: [
      { name: '实验性工具', slug: 'experimental', name_en: 'Experimental', name_zh: '实验性工具', sort_order: 1 },
      { name: '多功能工具', slug: 'multi-purpose', name_en: 'Multi-Purpose', name_zh: '多功能工具', sort_order: 2 },
      { name: '未分类', slug: 'uncategorized', name_en: 'Uncategorized', name_zh: '未分类', sort_order: 3 },
    ]
  },
]

async function main() {
  console.log('开始插入分类数据...\n')

  for (const categoryData of categories) {
    const { children, ...parentData } = categoryData

    // 创建一级分类
    const parent = await prisma.category.create({
      data: parentData,
    })

    console.log(`✓ 创建一级分类: ${parent.name_zh} (${parent.name_en})`)

    // 创建二级分类
    if (children && children.length > 0) {
      for (const childData of children) {
        const child = await prisma.category.create({
          data: {
            ...childData,
            parent_id: parent.id,
          },
        })
        console.log(`  └─ 创建二级分类: ${child.name_zh} (${child.name_en})`)
      }
    }
    console.log('')
  }

  console.log('分类数据插入完成！')

  // 统计信息
  const totalCategories = await prisma.category.count()
  const parentCategories = await prisma.category.count({
    where: { parent_id: null }
  })
  const childCategories = await prisma.category.count({
    where: { parent_id: { not: null } }
  })

  console.log('\n统计信息:')
  console.log(`总分类数: ${totalCategories}`)
  console.log(`一级分类: ${parentCategories}`)
  console.log(`二级分类: ${childCategories}`)
}

main()
  .catch((e) => {
    console.error('错误:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
