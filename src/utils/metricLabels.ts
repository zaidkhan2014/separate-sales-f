const METRIC_TITLE_OVERRIDES: Record<string, string> = {
  otp_requested: 'OTP requested',
  otp_success: 'OTP success',
  otp_failed: 'OTP failed',
}

function titleCaseFromSnakeCase(key: string): string {
  return key
    .split('_')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

/** Human-readable chart/card titles; known keys (e.g. OTP) use product acronyms. */
export function formatMetricTitle(key: string): string {
  const override = METRIC_TITLE_OVERRIDES[key]
  if (override) return override
  return titleCaseFromSnakeCase(key)
}
