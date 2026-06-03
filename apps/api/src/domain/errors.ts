/**
 * Domain errors carry a stable machine code + HTTP status. The HTTP layer maps
 * them to the standard `{ ok: false, error }` envelope (see app.onError).
 */
export class DomainError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number = 400,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class InvalidCredentialsError extends DomainError {
  constructor() {
    super("AUTH_INVALID_CREDENTIALS", "Email or password is incorrect", 401);
  }
}

export class AccountDisabledError extends DomainError {
  constructor() {
    super("AUTH_ACCOUNT_DISABLED", "This account is disabled", 403);
  }
}

export class EmailTakenError extends DomainError {
  constructor() {
    super("AUTH_EMAIL_TAKEN", "Email is already registered", 409);
  }
}

export class InvalidTokenError extends DomainError {
  constructor(message = "Invalid or expired token") {
    super("AUTH_INVALID_TOKEN", message, 401);
  }
}

export class NotFoundError extends DomainError {
  constructor(message = "Resource not found") {
    super("NOT_FOUND", message, 404);
  }
}

export class ForbiddenError extends DomainError {
  constructor(message = "You do not have permission to perform this action") {
    super("FORBIDDEN", message, 403);
  }
}
