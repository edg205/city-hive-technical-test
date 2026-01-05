// E.164: + followed by 10–15 digits, first digit 1–9
const E164_REGEX = /^\+[1-9]\d{9,14}$/;

export function normalizePhone(input: string): string {
  if (!input) return input;

  const raw = input.trim();

  // Keep only digits
  const digits = raw.replace(/\D/g, '');

  // Preserve leading + only if it was explicitly provided
  return raw.startsWith('+') ? `+${digits}` : digits;
}

export function isValidE164(phone: string): boolean {
  if (!phone) return false;
  return E164_REGEX.test(phone.trim());
}
