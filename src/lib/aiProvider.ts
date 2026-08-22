/**
 * Which service actually answers the lesson request.
 *
 * The credentials stay on the ANTHROPIC_* names on purpose: every provider
 * here speaks the Anthropic Messages API, so the SDK, the key, the base URL
 * and the model are all still "the Anthropic ones" — only the host differs.
 * PROVIDER selects the host's conventions, not a different set of variables.
 */

export const PROVIDERS = ["ANTHROPIC", "OPEN_ROUTER"] as const;

export type Provider = (typeof PROVIDERS)[number];

export const DEFAULT_PROVIDER: Provider = "ANTHROPIC";

interface ProviderDefaults {
  /** Used when ANTHROPIC_BASE_URL is unset. */
  baseUrl: string;
  /** Used when ANTHROPIC_MODEL is unset; null means it must be configured. */
  model: string | null;
  label: string;
  /** Sent on every request to this provider. */
  headers?: Record<string, string>;
}

const DEFAULTS: Record<Provider, ProviderDefaults> = {
  ANTHROPIC: {
    baseUrl: "https://api.anthropic.com",
    model: "claude-sonnet-4-6",
    label: "Anthropic",
  },
  OPEN_ROUTER: {
    baseUrl: "https://openrouter.ai/api",
    // OpenRouter serves hundreds of models and none of them is a sane
    // default, so this one has to be named explicitly.
    model: null,
    label: "OpenRouter",
    // Attribution on OpenRouter's dashboards; harmless if ignored.
    headers: { "X-Title": "Fluent" },
  },
};

export function isProvider(value: unknown): value is Provider {
  return (
    typeof value === "string" && (PROVIDERS as readonly string[]).includes(value)
  );
}

/**
 * Spellings a hand-edited .env plausibly contains. Anything outside this map
 * is a misconfiguration, not a variant.
 */
const ALIASES: Record<string, Provider> = {
  ANTHROPIC: "ANTHROPIC",
  CLAUDE: "ANTHROPIC",
  OPEN_ROUTER: "OPEN_ROUTER",
  OPENROUTER: "OPEN_ROUTER",
};

export function resolveProvider(value: unknown): Provider {
  if (typeof value !== "string" || !value.trim()) {
    return DEFAULT_PROVIDER;
  }

  const normalized = value.trim().toUpperCase().replace(/[\s-]+/g, "_");
  const matched = ALIASES[normalized];

  if (matched) {
    return matched;
  }

  // Falling back silently here would send, say, an OpenRouter key to
  // Anthropic and surface as a baffling 401. The request still proceeds on the
  // default, but the reason is on the record.
  console.error(
    `[ai] PROVIDER="${value}" is not recognised (expected ${PROVIDERS.join(" or ")}) — falling back to ${DEFAULT_PROVIDER}.`,
  );

  return DEFAULT_PROVIDER;
}

/**
 * Strips a trailing `/v1` from a base URL.
 *
 * The SDK appends `/v1/messages` itself, but every provider documents its base
 * WITH the `/v1` on the end — OpenRouter says `https://openrouter.ai/api/v1`,
 * Anthropic's docs write `https://api.anthropic.com/v1`. Copying the
 * documented value therefore produces `/v1/v1/messages`, which 404s with an
 * HTML error page that says nothing about the real cause. This is not
 * cleverness for its own sake: that exact 404 is what sent someone hunting
 * through the lesson code for a bug that was never there.
 */
export function normalizeBaseUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, "");

  return trimmed.replace(/\/v1$/i, "");
}

export interface AiProviderConfig {
  provider: Provider;
  label: string;
  /** Ready to hand to the SDK — already normalized. */
  baseUrl: string;
  model: string;
  defaultHeaders?: Record<string, string>;
  /** True when ANTHROPIC_BASE_URL had a redundant /v1 that was removed. */
  baseUrlWasNormalized: boolean;
}

export function getAiProviderConfig(): AiProviderConfig {
  const provider = resolveProvider(process.env.PROVIDER);
  const defaults = DEFAULTS[provider];

  const configuredBase = process.env.ANTHROPIC_BASE_URL?.trim();
  const rawBase = configuredBase || defaults.baseUrl;
  const baseUrl = normalizeBaseUrl(rawBase);
  const baseUrlWasNormalized = baseUrl !== rawBase.replace(/\/+$/, "");

  if (baseUrlWasNormalized) {
    console.warn(
      `[ai] ANTHROPIC_BASE_URL ends with /v1, which the SDK adds itself — using ${baseUrl}`,
    );
  }

  const model = process.env.ANTHROPIC_MODEL?.trim() || defaults.model;

  if (!model) {
    throw new Error(
      `PROVIDER=${provider} has no default model — set ANTHROPIC_MODEL.`,
    );
  }

  return {
    provider,
    label: defaults.label,
    baseUrl,
    model,
    defaultHeaders: defaults.headers,
    baseUrlWasNormalized,
  };
}
