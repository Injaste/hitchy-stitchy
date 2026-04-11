import { useEffect, useState } from "react";

const COOLDOWN_MS = 10_000;

export function useRefetch(refetch: () => void, cooldownMs = COOLDOWN_MS) {
  const [lastRefreshed, setLastRefreshed] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

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