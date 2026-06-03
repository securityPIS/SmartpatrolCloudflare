/** Injectable clock so use-cases stay pure and time is testable. */
export interface Clock {
  /** Current time in epoch milliseconds. */
  now(): number;
}
