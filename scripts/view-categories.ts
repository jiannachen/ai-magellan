import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 获取所有一级分类
  const parentCategories = await prisma.category.findMany({
    where: { parent_id: null },
    include: {
      children: {
        orderBy: { sort_order: 'asc' }
      }
    },
    orderBy: { sort_order: 'asc' }
  })

  console.log('=== AI工具分类体系 ===\n')

  parentCategories.forEach((parent, index) => {
    console.log(`${index + 1}. ${parent.name_zh} (${parent.name_en})`)
    console.log(`   Slug: ${parent.slug}`)
    console.log(`   二级分类数量: ${parent.children.length}`)

    if (parent.children.length > 0) {
      parent.children.forEach((child, childIndex) => {
        console.log(`   ${childIndex + 1}) ${child.name_zh} (${child.name_en}) - ${child.slug}`)
      })
    }
    console.log('')
  })

  console.log('\n=== 统计信息 ===')
  const stats = {
    total: await prisma.category.count(),
    parents: await prisma.category.count({ where: { parent_id: null } }),
    children: await prisma.category.count({ where: { parent_id: { not: null } } })
  }

  console.log(`总分类数: ${stats.total}`)
  console.log(`一级分类: ${stats.parents}`)
  console.log(`二级分类: ${stats.children}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
