/** True for root or a couple member (bride/groom). */
export const isAdminMember = (
  isRoot: boolean,
  isBride: boolean,
  isGroom: boolean,
): boolean => isRoot || isBride || isGroom;
