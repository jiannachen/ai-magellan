import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const categories = await prisma.category.findMany({
    orderBy: [
      { parent_id: 'asc' },
      { sort_order: 'asc' },
      { id: 'asc' }
    ],
    include: {
      children: true
    }
  })

  console.log('Existing categories:')
  console.log(JSON.stringify(categories, null, 2))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
