```typescript
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { calculateRiskScore, recordLoginAttempt } from '../server/auth';
import { db } from '@db';

describe('Risk Scoring System', () => {
  beforeEach(async () => {
    // Clear test data
    await db.delete().from('loginAttempts');
    await db.delete().from('riskFactors');
  });

  describe('calculateRiskScore', () => {
    it('should increase risk score for multiple failed attempts', async () => {
      const userId = 1;
      const ipAddress = '192.168.1.1';
      const userAgent = 'test-browser';

      // Create failed login attempts
      await db.insert('loginAttempts').values([
        { userId, successful: false, ipAddress, userAgent, timestamp: new Date() },
        { userId, successful: false, ipAddress, userAgent, timestamp: new Date() },
        { userId, successful: false, ipAddress, userAgent, timestamp: new Date() }
      ]);

      const score = await calculateRiskScore(userId, ipAddress, userAgent);
      expect(score).toBeGreaterThan(0);
    });

    it('should increase risk score for unknown IP', async () => {
      const userId = 1;
      const knownIp = '192.168.1.1';
      const unknownIp = '10.0.0.1';
      const userAgent = 'test-browser';

      // Create successful login from known IP
      await db.insert('loginAttempts').values({
        userId,
        successful: true,
        ipAddress: knownIp,
        userAgent,
        timestamp: new Date()
      });

      const score = await calculateRiskScore(userId, unknownIp, userAgent);
      expect(score).toBeGreaterThan(0);
    });

    it('should increase risk score for unusual user agent', async () => {
      const userId = 1;
      const ipAddress = '192.168.1.1';
      const knownAgent = 'common-browser';
      const unusualAgent = 'unusual-bot';

      // Create successful login with known user agent
      await db.insert('loginAttempts').values({
        userId,
        successful: true,
        ipAddress,
        userAgent: knownAgent,
        timestamp: new Date()
      });

      const score = await calculateRiskScore(userId, ipAddress, unusualAgent);
      expect(score).toBeGreaterThan(0);
    });
  });

  describe('recordLoginAttempt', () => {
    it('should record login attempt with risk factors', async () => {
      const userId = 1;
      const ipAddress = '192.168.1.1';
      const userAgent = 'test-browser';
      const score = 30;

      await recordLoginAttempt(userId, true, ipAddress, userAgent, score);

      const attempts = await db.select().from('loginAttempts').where({ userId });
      expect(attempts).toHaveLength(1);
      expect(attempts[0]).toMatchObject({
        userId,
        successful: true,
        ipAddress,
        userAgent,
        score
      });
    });

    it('should create risk factor record for high-risk attempts', async () => {
      const userId = 1;
      const ipAddress = '192.168.1.1';
      const userAgent = 'test-browser';
      const score = 75; // High risk score

      await recordLoginAttempt(userId, true, ipAddress, userAgent, score);

      const riskFactors = await db.select().from('riskFactors').where({ userId });
      expect(riskFactors).toHaveLength(1);
      expect(riskFactors[0].severity).toBe('high');
    });

    it('should update user risk score', async () => {
      const userId = 1;
      const ipAddress = '192.168.1.1';
      const userAgent = 'test-browser';
      const score = 50;

      await recordLoginAttempt(userId, true, ipAddress, userAgent, score);

      const [user] = await db.select().from('users').where({ id: userId });
      expect(user.riskScore).toBe(score);
    });
  });
});
```
