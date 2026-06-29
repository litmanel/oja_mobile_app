export function buildWhatsappDeepLink(phone: string, text: string): string {
  // Strip non-numeric characters from phone except leading +
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}
