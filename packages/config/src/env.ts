import { z } from 'zod';

declare var process: any;

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  FLW_PUBLIC_KEY: z.string().optional(),
  FLW_SECRET_KEY: z.string().optional(),
  FLW_SECRET_HASH: z.string().optional(),
  PAYSTACK_PUBLIC_KEY: z.string().optional(),
  PAYSTACK_SECRET_KEY: z.string().optional(),
  TERMII_API_KEY: z.string().optional(),
  TERMII_SENDER_ID: z.string().default('OjaOgbomoso'),
  AT_API_KEY: z.string().optional(),
  AT_USERNAME: z.string().optional(),
  GMAIL_USER: z.string().optional(),
  GMAIL_APP_PASSWORD: z.string().optional(),
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.coerce.number().default(587),
  EXPO_ACCESS_TOKEN: z.string().optional(),
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().default('oja-ogbomoso-media'),
  R2_PUBLIC_URL: z.string().optional(),
  JWT_PRIVATE_KEY: z.string(),
  JWT_PUBLIC_KEY: z.string(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_PORT: z.coerce.number().default(3001),
  API_HOST: z.string().default('0.0.0.0'),
  ADMIN_URL: z.string().url().default('http://localhost:3000'),
  MOBILE_DEEP_LINK_SCHEME: z.string().default('ojaogbomoso'),
  SENTRY_DSN: z.string().optional(),
  POSTHOG_API_KEY: z.string().optional(),
});

// In React Native, skip server-side env validation entirely.
// navigator.product === 'ReactNative' is set by the React Native runtime.
const isReactNative =
  typeof navigator !== 'undefined' && navigator.product === 'ReactNative';

let env: z.infer<typeof envSchema>;

if (isReactNative) {
  // On mobile, we don't validate server secrets — just pass through process.env.
  env = process.env as any;
} else {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.format());
    throw new Error('Invalid environment variables');
  }
  env = parsed.data;
}

export { env };
