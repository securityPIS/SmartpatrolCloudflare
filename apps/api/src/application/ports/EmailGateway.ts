export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/** Outbound email port (Resend in production, no-op in dev). */
export interface EmailGateway {
  send(message: EmailMessage): Promise<void>;
}
