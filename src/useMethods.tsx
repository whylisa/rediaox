import React from 'react';

/**
 * 持久化 function 的 Hook
 * @param methods
 */
export function useMethods<T extends Record<string, any>>(methods: T): T {
  const { current } = React.useRef({
    methods,
    initialized: false,
    func: undefined as T | undefined,
  });
  current.methods = methods;

  if (!current.initialized) {
    const func = Object.create(null);
    Object.keys(methods).forEach((key) => {
      func[key] = (...args: unknown[]) => current.methods[key].call(current.methods, ...args);
    });
    current.func = func;
    current.initialized = true;
  }

  return current.func!;
}
