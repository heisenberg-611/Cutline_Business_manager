import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const prisma = new PrismaClient()

async function exportUserData() {
  console.log("Fetching users with their associated projects and financial information...")
  
  try {
    const users = await prisma.user.findMany({
      include: {
        // Include direct user relations
        notifications: true,
        // Users are connected to businesses via memberships
        memberships: {
          include: {
            business: {
              include: {
                clients: true,
                // Fetch the projects tied to the business with all their relations
                projects: {
                  include: {
                    client: true,
                    statusStage: true,
                    stageHistory: true,
                    invoices: true,
                    notes: true,
                    links: true,
                    timeEntries: true,
                    assets: true,
                    expenses: true,
                    feedbackRequests: true,
                    testimonials: true,
                    reviewRequests: true
                  }
                },
                projectRequests: true,
                workflowTemplates: {
                  include: {
                    stages: true
                  }
                },
                // Fetch the financial information tied to the business
                invoices: {
                  include: {
                    lineItems: true,
                    payments: true,
                    creditNotes: true,
                    reminders: true
                  }
                },
                assets: true,
                payments: true,
                expenses: true,
                creditNotes: true,
                invoiceReminders: true,
                auditLogs: true,
                notifications: true,
                feedbackRequests: true,
                feedbackResponses: true,
                testimonials: true,
                reviewRequests: true,
                analyticsSnapshots: true
              }
            }
          }
        }
      }
    })

    // Because this data can be massive, we will save it to a JSON file instead of flooding the terminal
    const outputPath = 'scripts/user-data-export.json';
    fs.writeFileSync(outputPath, JSON.stringify(users, null, 2));
    
    console.log(`\n✅ Successfully fetched ${users.length} users!`)
    console.log(`📂 All data (including projects and financials) has been saved to: ${outputPath}`)
    
  } catch (error) {
    console.error('❌ Error fetching user data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

exportUserData()
