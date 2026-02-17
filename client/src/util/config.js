/* global process */
/**
 * Configuration utility to safely access environment variables.
 * This handles the difference between Vite's import.meta.env and Jest's environment.
 */

const getEnv = (key) => {
  // 1. Check process.env (Jest/Node environment)
  // We check for undefined explicitly to satisfy linting
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key];
  }

  // 2. Check import.meta.env (Vite environment)
  // We use new Function to hide this from the Jest parser which would otherwise
  // throw a SyntaxError: Cannot use 'import.meta' outside a module
  try {
    // This only runs in environments that support ESM properly (like Vite during build/dev)
    const meta = new Function("return import.meta")();
    if (meta && meta.env) {
      return meta.env[key];
    }
  } catch {
    // Fail silently - we probably are in a non-ESM environment or Jest
  }

  return undefined;
};

export const CLOUDINARY_CLOUD_NAME = getEnv("VITE_CLOUDINARY_CLOUD_NAME");
export const CLOUDINARY_UPLOAD_PRESET = getEnv("VITE_CLOUDINARY_UPLOAD_PRESET");
export const BACKEND_URL = getEnv("VITE_BACKEND_URL");
