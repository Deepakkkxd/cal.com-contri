import { useCallback, useEffect, useRef } from "react";

// credits: https://github.com/streamich/react-use/blob/master/src/useMountedState.ts
// jsdoc generated by chat-gpt :)
/**
 * A custom React hook that returns a function to check if the component is mounted.
 * @returns {function(): boolean} A function that returns `true` if the component is mounted and `false` otherwise.
 */
export default function useMountedState(): () => boolean {
  const mountedRef = useRef<boolean>(false);
  const get = useCallback(() => mountedRef.current, []);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  return get;
}
