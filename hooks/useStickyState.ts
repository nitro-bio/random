import { useEffect, useState } from "react";

/**
 * Custom React hook for managing state that persists in localStorage.
 * It synchronizes the state with localStorage, allowing for data persistence across page reloads.
 */
function useStickyState<T>({
  defaultValue,
  prefix,
  key,
  version,
}: {
  defaultValue: T;
  prefix: string;
  key: string;
  version: string;
}): [T, React.Dispatch<React.SetStateAction<T>>] {
  const internalKey = `${prefix}-${key}-${version}`;

  const [value, setValue] = useState(() => {
    const stickyValue = window.localStorage.getItem(internalKey);
    return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
  });
  useEffect(
    function updateLocalStorage() {
      window.localStorage.setItem(internalKey, JSON.stringify(value));
    },
    [internalKey, value],
  );
  return [value, setValue];
}

export { useStickyState };
