import { logInfo } from "./logging.js";

/**
 * Simulates sending a verification code via email by logging it to the console.
 * @param {Object} params
 * @param {string} params.email - Recipient email
 * @param {string} params.code - 5-digit verification code
 */
const sendCode = async ({ email, code }) => {
  logInfo("==== 📨 EMAIL VERIFICATION CODE 📨 ====");
  logInfo(`To: ${email}`);
  logInfo(`Code: ${code}`);
  logInfo("========================================");
  return true;
};

export default sendCode;
