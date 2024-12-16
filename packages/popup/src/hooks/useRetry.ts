import { MutableRef, useRef } from 'preact/hooks';

export interface UseRetryReturn {
  update(callback: Function): void;
}

interface UseRetryParams {
  amount: number;
  timeout: number;
}

export function useRetry(params: UseRetryParams): UseRetryReturn {
  const retries: MutableRef<number> = useRef(0);

  const update = (callback: Function): void => {
    if (retries.current >= params.amount) {
      return;
    }

    retries.current += 1;

    setTimeout((): void => {
      callback();
    }, params.timeout);
  };

  return {
    update,
  };
}
