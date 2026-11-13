import { useCallback, useEffect, useState } from "react";

export const useCooldown = (seconds: number, startActive = false) => {
  const [remaining, setRemaining] = useState(startActive ? seconds : 0);

  useEffect(() => {
    if (remaining <= 0) return;
    const timer = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining]);

  const start = useCallback(() => setRemaining(seconds), [seconds]);

  return { remaining, isActive: remaining > 0, start };
};
