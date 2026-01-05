export function normalizePhone(input: string): string {
  return input.replace(/[^\d+]/g, '');
}

export function isValidE164(phone: string): boolean {
  return /^[1-9]\d{9,14}$/.test(phone);
}
