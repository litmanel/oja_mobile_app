// Stub for Termii and Africa's Talking
export async function sendOtp(phone: string, otp: string) {
  // Implement SMS sending
}

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
