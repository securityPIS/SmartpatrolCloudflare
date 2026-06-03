import type { EmailGateway, EmailMessage } from "../../application/ports/EmailGateway";

/** Dev fallback when no email provider is configured — just logs. */
export class NoopEmailGateway implements EmailGateway {
  async send(message: EmailMessage): Promise<void> {
    console.log(`[email:noop] to=${message.to} subject=${JSON.stringify(message.subject)}`);
  }
}
