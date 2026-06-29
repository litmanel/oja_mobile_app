import { FastifyInstance } from 'fastify';
import { db } from '@oja/db';
import { otpAttempts } from '@oja/db';
import { sql } from 'drizzle-orm';
import { generateOtp } from '../../../utils/otp';
import { sendOtpEmail } from '../../../utils/mailer';

const E164_REGEX = /^\+234\d{10}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function otpRequestRouter(fastify: FastifyInstance) {
  fastify.post('/', async (request, reply) => {
    const body = request.body as { phone_number?: string; email?: string };

    // ── Validate inputs ──
    if (!body.phone_number || !E164_REGEX.test(body.phone_number)) {
      return reply.status(400).send({
        success: false,
        error: 'Invalid phone number. Must be E.164 format (+234XXXXXXXXXX)',
      });
    }

    if (!body.email || !EMAIL_REGEX.test(body.email)) {
      return reply.status(400).send({
        success: false,
        error: 'Invalid email format',
      });
    }

    // ── Rate limit: max 3 requests per phone per hour ──
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentAttempts = await db
      .select()
      .from(otpAttempts)
      .where(
        sql`${otpAttempts.phone} = ${body.phone_number} AND ${otpAttempts.createdAt} > ${oneHourAgo}`
      );

    if (recentAttempts.length >= 3) {
      return reply.status(429).send({
        success: false,
        error: 'Too many OTP requests. Please try again in an hour.',
      });
    }

    // ── Generate and store OTP ──
    const code = generateOtp();

    await db.insert(otpAttempts).values({
      phone: body.phone_number,
      email: body.email,
      code,
    });

    // ── Send OTP via email ──
    try {
      await sendOtpEmail(body.email, code);
    } catch (err) {
      fastify.log.error(err);
      return reply.status(500).send({
        success: false,
        error: 'Failed to send verification email. Please try again.',
      });
    }

    return reply.status(200).send({
      success: true,
      data: {
        message: 'OTP sent to email',
        expires_in: 300,
      },
    });
  });
}
