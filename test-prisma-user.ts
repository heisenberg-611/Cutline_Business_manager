import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testPrismaInsert() {
  console.log("Testing Prisma User Insertion...")
  try {
    const user = await prisma.user.upsert({
      where: { id: "user_test123" },
      update: {
        email: "test@cutline.tech",
        firstName: "Test",
        lastName: "User",
        imageUrl: "https://example.com/image.jpg"
      },
      create: {
        id: "user_test123",
        email: "test@cutline.tech",
        firstName: "Test",
        lastName: "User",
        imageUrl: "https://example.com/image.jpg"
      }
    })
    console.log("✅ Successfully inserted user:", user)
    
    // Clean up
    await prisma.user.delete({ where: { id: "user_test123" } })
    console.log("🧹 Cleaned up test user")
  } catch (error) {
    console.error("❌ Prisma Error:", error)
  } finally {
    await prisma.$disconnect()
  }
}

testPrismaInsert()
