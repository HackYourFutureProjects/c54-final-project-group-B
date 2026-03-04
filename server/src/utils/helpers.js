/**
 * Check if a value is a non-null, non-array object (a "plain" object).
 * Used for validating request body shapes before processing.
 *
 * @param {*} val - The value to check.
 * @returns {boolean}
 */
export const isPlainObject = (val) =>
  val != null && typeof val === "object" && !Array.isArray(val);
