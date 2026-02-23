export const formatPrice = (price) =>
  price?.$numberDecimal ?? price?.value ?? price ?? "—";
