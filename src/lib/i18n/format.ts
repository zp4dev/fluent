import { Fragment, createElement, type ReactNode } from "react";

/**
 * Interpolation for dictionary strings.
 *
 * Dictionary entries carry their placeholders inline ("Còn lại: {remaining}/{limit}
 * lượt hôm nay") so a translator controls word order. Building the same sentence
 * by concatenating fragments at the call site would freeze Vietnamese word order
 * into every other language.
 */
const PLACEHOLDER = /\{(\w+)\}/g;

/** Fills {placeholders} with plain text. Unknown keys are left untouched. */
export function fmt(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(PLACEHOLDER, (token, key: string) =>
    key in values ? String(values[key]) : token,
  );
}

/**
 * Same, but each placeholder may be replaced by a React node — a <Link>, a
 * <span className="font-bold">, an <strong>. Use this instead of splitting a
 * sentence into prefix/suffix keys around the markup.
 */
export function rich(
  template: string,
  values: Record<string, ReactNode>,
): ReactNode[] {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let slot = 0;

  for (const match of template.matchAll(PLACEHOLDER)) {
    const token = match[0];
    const key = match[1];
    const start = match.index ?? 0;

    if (start > cursor) {
      nodes.push(template.slice(cursor, start));
    }

    if (key in values) {
      // Wrapped in a keyed Fragment so React never warns about the array, even
      // when the same placeholder name appears twice.
      nodes.push(
        createElement(Fragment, { key: `${key}-${slot}` }, values[key]),
      );
    } else {
      nodes.push(token);
    }

    cursor = start + token.length;
    slot += 1;
  }

  if (cursor < template.length) {
    nodes.push(template.slice(cursor));
  }

  return nodes;
}
