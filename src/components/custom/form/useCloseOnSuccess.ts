import { useEffect } from "react";

export const useCloseOnSuccess = (
  isSuccess: boolean,
  onClose: () => void,
  delay: number | false = 300,
) => {
  useEffect(() => {
    if (!isSuccess || delay === false) return;
    const id = setTimeout(onClose, delay);
    return () => clearTimeout(id);
  }, [isSuccess, onClose, delay]);
};
