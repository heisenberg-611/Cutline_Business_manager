import { randomBytes } from 'crypto'

/**
 * Generates a cryptographically random token and executes a callback that uses it.
 * If the callback fails with a P2002 (unique constraint violation), it retries
 * with a new token up to `maxRetries` times.
 *
 * This handles the astronomically-unlikely-but-possible token collision on
 * @@unique(token) fields like FeedbackRequest.token and ReviewRequest.token.
 */
export async function withUniqueToken<T>(
  callback: (token: string) => Promise<T>,
  maxRetries: number = 3,
  tokenBytes: number = 24
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const token = randomBytes(tokenBytes).toString('hex')
    try {
      return await callback(token)
    } catch (err: any) {
      if (err.code === 'P2002' && attempt < maxRetries) {
        // Token collision — retry with a new one
        continue
      }
      throw err
    }
  }

  // Should be unreachable, but satisfies TypeScript
  throw new Error('Failed to generate unique token after max retries')
}
