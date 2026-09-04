import { getRequestConfig } from "next-intl/server";

// English-only: no locale routing, no negotiation — just the one message
// catalog, always.
export default getRequestConfig(async () => ({
  locale: "en",
  messages: (await import("../messages/en.json")).default,
}));
