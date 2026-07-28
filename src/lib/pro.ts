import { isProByEmail } from "@/lib/entitlements";
import { isProLicense } from "@/lib/license";

/**
 * The single server-side Pro check.
 *
 * Two paths run in parallel and either one is enough:
 *  - a manually activated order for this email (current bank-transfer flow)
 *  - a valid Lemon Squeezy license key (grandfathered buyers)
 *
 * The entitlement is checked first because it's one Redis GET, while the
 * license path can reach out to Lemon Squeezy on a cache miss.
 */
export async function isProUser(input: {
  email?: string | null;
  licenseKey?: string | null;
}): Promise<boolean> {
  if (await isProByEmail(input.email)) {
    return true;
  }

  return isProLicense(input.licenseKey);
}
