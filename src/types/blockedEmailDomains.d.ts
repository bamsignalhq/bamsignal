declare module "../../shared/blockedEmailDomains.mjs" {
  export const BLOCKED_EMAIL_DOMAINS: ReadonlySet<string>;
  export function extractEmailDomain(email?: string): string;
  export function isDisposableEmailDomain(domain?: string): boolean;
  export function isDisposableEmail(email?: string): boolean;
}

declare module "*/shared/blockedEmailDomains.mjs" {
  export const BLOCKED_EMAIL_DOMAINS: ReadonlySet<string>;
  export function extractEmailDomain(email?: string): string;
  export function isDisposableEmailDomain(domain?: string): boolean;
  export function isDisposableEmail(email?: string): boolean;
}
