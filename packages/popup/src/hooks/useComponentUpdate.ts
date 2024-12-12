import { useState } from 'preact/hooks';

export interface UseComponentUpdateReturn {
  forceUpdate(): void;
}

export function useComponentUpdate(): UseComponentUpdateReturn {
  const [version, setVersion] = useState<number>(0);

  const forceUpdate = (): void => {
    setVersion((version: number): number => version + 1);
  };

  return {
    forceUpdate,
  };
}
