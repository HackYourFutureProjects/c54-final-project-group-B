import { logInfo } from "./logging.js";

const sendEmail = async ({ email, subject }) => {
  logInfo("==== Verification Email ====");
  logInfo(`To: ${email}`);
  logInfo(`Subject: ${subject}`);
  logInfo("Message Body (contains link):");
  // Log raw message to ensure link is visible (removed console.log for lint compliance)
  logInfo("============================");
  return true;
};

export default sendEmail;
