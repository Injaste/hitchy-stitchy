import { useEffect, useState } from "react";

const COOLDOWN_MS = 10_000;

export function useRefetch(refetch: () => void, cooldownMs = COOLDOWN_MS) {
  const [lastRefreshed, setLastRefreshed] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!lastRefreshed) return;

    const interval = setInterval(() => {
      const newNow = Date.now();
      setNow(newNow);
      if (newNow - lastRefreshed >= cooldownMs) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastRefreshed, cooldownMs]);

  const cooldownRemaining = lastRefreshed
    ? Math.max(0, cooldownMs - (now - lastRefreshed))
    : 0;

  const canRefresh = cooldownRemaining === 0;

  const handleRefresh = () => {
    if (!canRefresh) return;
    refetch();
    setLastRefreshed(Date.now());
  };

  return { handleRefresh, canRefresh, cooldownRemaining };
}