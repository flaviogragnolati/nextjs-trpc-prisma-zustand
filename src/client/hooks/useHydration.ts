import { useState, useEffect } from 'react';
import { useAppStore } from '@/store';

export const useHydration = () => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // To take into account manual rehydration.
    const unsubHydrate = useAppStore.persist.onHydrate(() =>
      setHydrated(false),
    );

    const unsubFinishHydration = useAppStore.persist.onFinishHydration(() =>
      setHydrated(true),
    );

    setHydrated(useAppStore?.persist?.hasHydrated());

    return () => {
      unsubHydrate();
      unsubFinishHydration();
    };
  }, []);

  return hydrated;
};
