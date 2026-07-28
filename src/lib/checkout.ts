// Where every "upgrade / support Fluent" call to action points.
//
// This is the in-app bank-transfer checkout (VietQR + manual activation), not
// an external payment provider — so it's an internal route and should be
// navigated to with next/link, not opened in a new tab.
export const CHECKOUT_URL = "/nang-cap";
