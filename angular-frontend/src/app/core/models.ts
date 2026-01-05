export type User = { id: string; email: string };

export type Message = {
  id: string;
  to_number: string;
  from_number: string;
  body: string;
  twilio_sid?: string;
  status: string;
  error_code?: number | null;
  created_at: string;
};
