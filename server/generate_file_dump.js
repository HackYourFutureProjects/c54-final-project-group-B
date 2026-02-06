
import fs from "fs";
import path from "path";

const files = [
  "server/src/models/User.js",
  "server/src/routes/user.js",
  "server/src/controllers/user.js",
  "server/src/middleware/auth.js",
  "server/src/util/generateToken.js",
  "server/src/util/sendCode.js",
  "server/src/__testUtils__/dbMock.js",
  "client/src/pages/Signup.jsx",
  "client/src/pages/VerifyCode.jsx",
  "client/src/pages/Login.jsx",
  "client/src/context/AuthContext.jsx",
  "client/src/util/ProtectedRoute.jsx",
  "client/src/App.jsx",
  "server/.env",
  "server/package.json",
  "client/vite.config.js"
];

const outputFile = "planning/AUTH_MVP_FILES.txt";
const stream = fs.createWriteStream(outputFile);

files.forEach(file => {
  stream.write(`\n\n================================================================================\n`);
  stream.write(`FILE: ${file}\n`);
  stream.write(`================================================================================\n`);
  try {
    const content = fs.readFileSync(file, "utf8");
    stream.write(content);
  } catch (err) {
    stream.write(`[Error reading file: ${err.message}]\n`);
  }
});

stream.end();
console.log(`Generated ${outputFile}`);
