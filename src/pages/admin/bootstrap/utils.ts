/** True for root or a couple member (bride/groom). */
export const isSuperAdmin = (
  isRoot: boolean,
  isBride: boolean,
  isGroom: boolean,
): boolean => isRoot || isBride || isGroom;
