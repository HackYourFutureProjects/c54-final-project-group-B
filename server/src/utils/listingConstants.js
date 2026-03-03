/**
 * Allowed fields for listing creation/update.
 * Shared between listing.js and admin.js controllers to avoid duplication.
 * Prevents prototype pollution by whitelisting only known fields.
 */
export const ALLOWED_UPDATE_FIELDS = [
  "title",
  "description",
  "price",
  "images",
  "location",
  "brand",
  "model",
  "year",
  "condition",
  "mileage",
  "status",
  "category",
  "coordinates",
];
