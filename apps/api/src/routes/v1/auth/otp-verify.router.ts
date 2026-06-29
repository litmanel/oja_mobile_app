import { FastifyInstance } from 'fastify';
import { db } from '@oja/db';
import { otpAttempts, users, vendors } from '@oja/db';
import { sql, desc, eq } from 'drizzle-orm';
import crypto from 'crypto';
import { signAccessToken, signRefreshToken } from '../../../utils/jwt';
import { tokenBlacklist } from '@oja/db';

const E164_REGEX = /^\+234\d{10}$/;

export default async function otpVerifyRouter(fastify: FastifyInstance) {
  fastify.post('/', async (request, reply) => {
    const body = request.body as {
      phone_number?: string;
      otp?: string;
      role?: 'vendor' | 'buyer';
    };

    // ── Validate inputs ──
    if (!body.phone_number || !E164_REGEX.test(body.phone_number)) {
      return reply.status(400).send({
        success: false,
        error: 'Invalid phone number. Must be E.164 format (+234XXXXXXXXXX)',
      });
    }

    if (!body.otp || !/^\d{6}$/.test(body.otp)) {
      return reply.status(400).send({
        success: false,
        error: 'Invalid OTP. Must be a 6-digit code.',
      });
    }

    if (!body.role || !['vendor', 'buyer'].includes(body.role)) {
      return reply.status(400).send({
        success: false,
        error: 'Role must be "vendor" or "buyer".',
      });
    }

    // ── Find most recent OTP for this phone ──
    const [latestOtp] = await db
      .select()
      .from(otpAttempts)
      .where(eq(otpAttempts.phone, body.phone_number))
      .orderBy(desc(otpAttempts.createdAt))
      .limit(1);

    if (!latestOtp) {
      return reply.status(400).send({
        success: false,
        error: 'No OTP found. Please request a new code.',
      });
    }

    // ── Check 5-minute expiry ──
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (latestOtp.createdAt < fiveMinutesAgo) {
      return reply.status(400).send({
        success: false,
        error: 'OTP expired. Please request a new code.',
      });
    }

    // ── Verify code match ──
    if (latestOtp.code !== body.otp) {
      return reply.status(400).send({
        success: false,
        error: 'Invalid OTP code.',
      });
    }

    // ── Check if user exists by phone ──
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.phone, body.phone_number))
      .limit(1);

    let userId: string;
    let vendorId: string | undefined;
    let isNewVendor = false;

    if (existingUser) {
      // Existing user — find their vendor record
      userId = existingUser.id;
      const [existingVendor] = await db
        .select()
        .from(vendors)
        .where(eq(vendors.userId, existingUser.id))
        .limit(1);

      if (existingVendor) {
        vendorId = existingVendor.id;
      }
    } else if (body.role === 'vendor') {
      // New vendor — create user + vendor records
      const [newUser] = await db
        .insert(users)
        .values({
          phone: body.phone_number,
          displayName: body.phone_number, // Placeholder until onboarding
          role: 'vendor',
        })
        .returning();

      userId = newUser.id;

      const [newVendor] = await db
        .insert(vendors)
        .values({
          userId: newUser.id,
          shopName: 'My Shop', // Placeholder until onboarding
          verificationStatus: 'pending',
          contactEmail: latestOtp.email,
        })
        .returning();

      vendorId = newVendor.id;
      isNewVendor = true;
    } else {
      // New buyer — create user only
      const [newUser] = await db
        .insert(users)
        .values({
          phone: body.phone_number,
          displayName: body.phone_number,
          role: 'buyer',
        })
        .returning();

      userId = newUser.id;
    }

    // ── Issue tokens ──
    const tokenPayload = { userId, vendorId, role: body.role };
    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    // ── Store refresh token hash for revocation tracking ──
    const refreshTokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    await db.insert(tokenBlacklist).values({
      token: refreshTokenHash,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    return reply.status(200).send({
      success: true,
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        vendor_id: vendorId || null,
        is_new_vendor: isNewVendor,
      },
    });
  });
}
