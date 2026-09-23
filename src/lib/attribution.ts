// Ad network attribution.
//
// The network lands users on any page of the site with their click id (txid)
// and publisher id (pubid) on the query string. Signup happens later, possibly
// after a reload or a walk through onboarding, so the pair is parked in
// localStorage and read back when the account is registered.

export type Attribution = {
  txid: string;
  pubid: string;
  ts: number;
};

const STORAGE_KEY = "attribution";

// How long a click stays creditable. Beyond this a signup counts as organic
// rather than being attributed to a click the user barely remembers.
const ATTRIBUTION_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Reads txid/pubid off the current URL and stores them. Call once per page
 * load. A visit carrying no params leaves any existing attribution intact, so
 * an organic return visit does not wipe a click that is still in window.
 */
export const captureAttribution = (search?: string) => {
  if (typeof window === "undefined") return;

  try {
    const params = new URLSearchParams(search ?? window.location.search);
    const txid = params.get("txid")?.trim();
    const pubid = params.get("pubid")?.trim();

    if (!txid?.length || !pubid?.length) return;

    const value: Attribution = { txid, pubid, ts: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Private mode or a blocked store: attribution is best effort and must
    // never break the page the user actually came to see.
  }
};

/**
 * Returns the stored attribution, or null when there is none or it has aged
 * out of the window.
 */
export const getAttribution = (): Attribution | null => {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<Attribution>;
    if (!parsed?.txid?.length || !parsed?.pubid?.length) return null;

    if (typeof parsed.ts !== "number" || Date.now() - parsed.ts > ATTRIBUTION_WINDOW_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return { txid: parsed.txid, pubid: parsed.pubid, ts: parsed.ts };
  } catch {
    return null;
  }
};

/**
 * The txid/pubid pair as registration payload fields, or an empty object when
 * there is nothing to report. Spread straight into the register body.
 */
export const attributionPayload = (): { txid?: string; pubid?: string } => {
  const attribution = getAttribution();
  if (!attribution) return {};
  return { txid: attribution.txid, pubid: attribution.pubid };
};
