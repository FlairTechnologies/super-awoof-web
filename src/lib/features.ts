/**
 * Feature flags.
 *
 * DEPOSIT_ENABLED_FOR_SUBSCRIBERS gates coin purchase for VAS (MTN) subscribers
 * while the licence for that is outstanding. Web/email users are unaffected and
 * keep the Paystack purchase flow.
 *
 * To re-enable once the licence lands: set this to true and redeploy. No other
 * change is needed — every deposit entry point reads canDeposit() below.
 */
export const DEPOSIT_ENABLED_FOR_SUBSCRIBERS = false;

/**
 * A VAS subscriber is a user who arrived through the MTN short-code flow, which
 * we identify by a phone-based login. Mirrors the existing check that the
 * deposit page already used to pick its layout.
 */
export const isVasSubscriber = (user: any): boolean =>
  Boolean(user?.loginMode === "phone" || user?.phone);

/**
 * Whether this user may see and reach the deposit-coins feature at all.
 * Entry points (buttons, modals, routes, onboarding copy) must all gate on this.
 */
export const canDeposit = (user: any): boolean => {
  if (isVasSubscriber(user)) return DEPOSIT_ENABLED_FOR_SUBSCRIBERS;
  return true;
};
