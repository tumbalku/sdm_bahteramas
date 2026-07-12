export const failedPasswordVerifyAttempts = new Map<string, number[]>();

export const PASSWORD_VERIFY_MAX_FAILED_ATTEMPTS = 5;
export const PASSWORD_VERIFY_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

export function prunePasswordVerifyAttempts(userId: string, now: number) {
  const attempts = failedPasswordVerifyAttempts.get(userId) || [];
  const activeAttempts = attempts.filter(
    (time) => now - time < PASSWORD_VERIFY_RATE_LIMIT_WINDOW_MS
  );
  failedPasswordVerifyAttempts.set(userId, activeAttempts);
  return activeAttempts;
}

export function recordPasswordVerifyFailure(userId: string, now: number) {
  const attempts = prunePasswordVerifyAttempts(userId, now);
  attempts.push(now);
  failedPasswordVerifyAttempts.set(userId, attempts);
  return attempts;
}

export function clearPasswordVerifyFailures(userId: string) {
  failedPasswordVerifyAttempts.delete(userId);
}
