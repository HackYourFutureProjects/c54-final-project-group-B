import { logInfo } from "./logging.js";

const sendEmail = async ({ email, subject, message }) => {
  logInfo("==== Verification Email ====");
  logInfo(`To: ${email}`);
  logInfo(`Subject: ${subject}`);
  logInfo(`Message Body (contains link):`);
  console.log(message); // Log raw message to ensure link is visible
  logInfo("============================");
  return true;
};

export default sendEmail;
