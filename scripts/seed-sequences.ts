/**
 * One-time migration script: Seeds clientSequence and projectSequence on each Business
 * from the current count of existing clients/projects, so no displayId collisions
 * occur for businesses with existing data.
 *
 * Run with: npx tsx scripts/seed-sequences.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const businesses = await prisma.business.findMany({ select: { id: true } })

  for (const biz of businesses) {
    const [clientCount, projectCount] = await Promise.all([
      prisma.client.count({ where: { businessId: biz.id } }),
      prisma.project.count({ where: { businessId: biz.id } }),
    ])

    await prisma.business.update({
      where: { id: biz.id },
      data: {
        clientSequence: clientCount,
        projectSequence: projectCount,
      },
    })

    console.log(`Business ${biz.id}: clientSequence=${clientCount}, projectSequence=${projectCount}`)
  }

  console.log(`\nDone — seeded ${businesses.length} businesses.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
