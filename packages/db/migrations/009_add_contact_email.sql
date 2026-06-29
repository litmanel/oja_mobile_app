-- Add contact_email column to vendors table
ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "contact_email" VARCHAR(255);

-- Recreate otp_attempts table with individual OTP row design
DROP TABLE IF EXISTS "otp_attempts";

CREATE TABLE "otp_attempts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "phone" text NOT NULL,
  "email" text NOT NULL,
  "code" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
