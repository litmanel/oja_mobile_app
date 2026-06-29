import { PLATFORM_FEE_RATE } from '../constants';

export function calculatePlatformFee(amountKobo: number): number {
  return Math.floor(amountKobo * PLATFORM_FEE_RATE);
}

export function calculateVendorPayout(amountKobo: number): number {
  return amountKobo - calculatePlatformFee(amountKobo);
}
