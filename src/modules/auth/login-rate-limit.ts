export const failedLoginAttempts = new Map<string, number[]>();

export const LOGIN_MAX_FAILED_ATTEMPTS = 5;
export const LOGIN_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

export function pruneLoginAttempts(identifier: string, now: number) {
  const attempts = failedLoginAttempts.get(identifier) || [];
  const activeAttempts = attempts.filter(
    (time) => now - time < LOGIN_RATE_LIMIT_WINDOW_MS
  );
  failedLoginAttempts.set(identifier, activeAttempts);
  return activeAttempts;
}

export function recordLoginFailure(identifier: string, now: number) {
  const attempts = pruneLoginAttempts(identifier, now);
  attempts.push(now);
  failedLoginAttempts.set(identifier, attempts);
  return attempts;
}

export function clearLoginFailures(identifier: string) {
  failedLoginAttempts.delete(identifier);
}
