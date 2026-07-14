import { auth } from '@clerk/nextjs/server'

export async function requireAdmin() {
  const { userId, orgId, orgRole } = await auth()
  
  if (!userId || !orgId) {
    throw new Error('Unauthorized')
  }

  if (orgRole !== 'org:admin') {
    throw new Error('Forbidden: Admins only')
  }

  return { userId, orgId, orgRole }
}
