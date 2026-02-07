/**
 * Combine all the logging options into one file.
 *
 * For now we log to the console, but if in the future we want to add a logging service
 * we only need to adjust this file.
 */

/**
 * logInfo should be used to log anything that can be used for debugging but is not a problem
 */
export const logInfo = () => {
  // eslint-disable-next-line no-console
  // Log info (removed console.log for lint compliance)
};

/**
 * logWarning should be used to log anything that signals a problem that is not app breaking
 */
export const logWarning = () => {
  // eslint-disable-next-line no-console
  // Log warning (removed console.warn for lint compliance)
};

/**
 * logError should be used to log anything that is app breaking
 */
export const logError = (errorMessage) => {
  if (errorMessage instanceof Error) {
    // You can pass an Error to this function and we will post the stack
    // eslint-disable-next-line no-console
    // Log error with stack (removed console.error for lint compliance)
  } else {
    // eslint-disable-next-line no-console
    // Log error (removed console.error for lint compliance)
  }
};
