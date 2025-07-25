import crypto from 'crypto';

export class AuthService {
  private static secretKey: string = process.env.API_SECRET_KEY || '';

  static validateApiKey(providedKey: string): boolean {
    if (!this.secretKey) {
      console.error('API_SECRET_KEY not configured');
      return false;
    }
    
    return crypto.timingSafeEqual(
      Buffer.from(providedKey),
      Buffer.from(this.secretKey)
    );
  }

  static validateUserId(userId: string): boolean {
    // Basic validation - in production, this would validate against RevenueCat
    if (!userId || typeof userId !== 'string') {
      return false;
    }
    
    // Check if userId follows a valid pattern (UUID-like)
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidPattern.test(userId) || userId.length >= 8;
  }

  static async validateWithRevenueCat(userId: string): Promise<boolean> {
    // TODO: Implement RevenueCat validation
    // For now, we'll just validate the format
    return this.validateUserId(userId);
  }
}