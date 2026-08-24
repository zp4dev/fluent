/**
 * An error whose message is written for the person using the app, and is
 * therefore safe to send back in an API response.
 *
 * Everything else — vendor response bodies, SDK errors, missing config — is
 * logged server-side and replaced with a generic message, so internal detail
 * can't escape through an error string.
 */
export class UserFacingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserFacingError";
  }
}
