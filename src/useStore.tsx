import React from 'react';
import type { Draft, Immutable } from 'immer';
import produce from 'immer';

type ShiftFirstArg<T> = T extends (first: any, ...rest: infer P) => infer R
  ? (...args: P) => R extends Promise<unknown> ? R : void
  : never;

type ShiftActions<T> = { [key in keyof T]: ShiftFirstArg<T[key]> };

export type Reducer<S> = (draft: Draft<S>, ...args: any[]) => void | S;
export type Reducers<S> = Record<string, Reducer<S>>;

/**
 * Store type
 */
export type Store<S, R> = {
  state: S;
  reducers: R;
};

/**
 * actions type
 */
export type Actions<M> = M extends Store<unknown, infer R> ? ShiftActions<R> : never;

/**
 * 链式定义 state
 */
export function defineState<S>(state: S) {
  return {
    state,
    defineReducers<R extends Reducers<S>>(reducers: R) {
      return {
        state,
        reducers,
      };
    },
  };
}

/**
 * store 定义
 */
export function defineStore<S, R extends Reducers<S>>(store: Store<S, R>) {
  return store;
}

/**
 * 状态聚合管理 hook
 */
export function useStore<S, R extends Reducers<S>>(store: Store<S, R>) {
  const [state, updateState] = React.useState(store.state);

  const { current } = React.useRef({
    func: undefined as Actions<Store<S, R>> | undefined,
    initialized: false,
    state,
    reducers: store.reducers,
  });
  current.state = state;
  current.reducers = store.reducers;

  if (!current.initialized) {
    const func = Object.create(null);
    // reducers
    Object.keys(store.reducers).forEach((key) => {
      func[key] = (...args: unknown[]) => {
        // 使用当前的 reducer
        current.state = produce(current.reducers[key]).call(
          store.reducers,
          current.state as Immutable<Draft<S>>,
          ...args,
        ) as S;
        return updateState(current.state);
      };
    });
    current.func = func;
    current.initialized = true;
  }

  return [state, current.func!] as const;
}
