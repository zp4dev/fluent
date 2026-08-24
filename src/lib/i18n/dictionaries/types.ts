import type vi from "./vi";

/**
 * Every locale must provide exactly the keys Vietnamese provides. Deriving the
 * type from the vi dictionary (rather than hand-writing an interface) means a
 * new key can only be added in one place, and the other three files fail to
 * compile until they carry it too.
 */
export type Dictionary = typeof vi;
