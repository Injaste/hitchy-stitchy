/** Singapore display price. Drops the trailing .00 for whole amounts. */
export const formatPrice = (price: number) =>
  `S$${price % 1 === 0 ? price : price.toFixed(2)}`;
