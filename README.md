# rediaox

> 状态聚合管理 hook

1. 聚合 `state` 和 `reducer`
1. 基于 `immer` 极致 `immutable` 数据
1. 类型完备支持，可自动识别

### Why?

在 `heo` 中，将 `useState` 及各个 `hooks` 状态提升，统一用作状态管理，以支撑日常业务开发。

但常见的 `useState` 用法会使 `React` 在 `class` 时代的高聚合 `State` 拆分开来；`useReducer` 用法就如同原生 `redux` 一样充斥着大量的 `switch case` 且类型提示一塌糊涂。

因此 `rediaox` 诞生，他有着 `useReducer` 高聚合状态的优点，且类型完备，可以完美结合 `heo` 用作状态管理。

## Install

```bash
yarn add rediaox
```

## Usage

### 组件内使用

```typescript
import React from 'react';
import { Button, Space, message } from 'antd';
import { useStore } from 'rediaox';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function DocDemo() {
  const [state, actions] = useStore({
    state: {
      count: 0,
    },
    reducers: {
      // 特性1：修改 draft
      increment(draft) {
        draft.count += 1;
      },
      // 特性2：返回新状态
      decrement(draft) {
        return {
          count: draft.count - 1,
        };
      },
      // 特性3：方法参数
      add(draft, count: number) {
        draft.count += count;
      },
      // 特性4：调用其他 reducer
      callOtherReducer(draft) {
        this.add(draft, 10);
        draft.count += 10;
      },
      reset() {
        return {
          count: 0,
        };
      },
    },
  });

  async function asyncExecute() {
    await sleep(1000);
    actions.increment();
    message.success('执行成功');
  }

  return (
    <Space>
      count: <strong>{state.count}</strong>
      <Button onClick={actions.increment}>增加</Button>
      <Button onClick={actions.decrement}>减少</Button>
      <Button onClick={() => actions.add(2)}>加2</Button>
      <Button onClick={actions.reset}>重置</Button>
      <Button type="primary" onClick={asyncExecute}>
        异步增加
      </Button>
    </Space>
  );
}

export default DocDemo;
```

### 配合 heo 使用

```typescript
import React from 'react';
import { Button, Space } from 'antd';
import { createContainer } from 'heo';
import { useStore } from 'rediaox';

const DemoStore = createContainer(() => {
  const [state, actions] = useStore({
    state: {
      count: 0,
    },
    reducers: {
      increment(draft) {
        draft.count += 1;
      },
      decrement(draft) {
        draft.count -= 1;
      },
    },
  });

  return {
    ...state,
    actions,
  };
});

function Demo() {
  const { count, actions } = DemoStore.usePicker(['count', 'actions']);

  return (
    <Space>
      count: <strong>{count}</strong>
      <Button onClick={actions.increment}>增加</Button>
      <Button onClick={actions.decrement}>减少</Button>
    </Space>
  );
}

export default function Wrapper() {
  return (
    <DemoStore.Provider>
      <Demo />
    </DemoStore.Provider>
  );
}
```

### 使用 defineStore

```typescript
import React from 'react';
import { Button, Space } from 'antd';
import type { Actions } from 'rediaox';
import { useStore, defineStore } from 'rediaox';

interface CounterState {
  count: number;
}

const store = defineStore({
  state: {
    count: 0,
  } as CounterState,
  reducers: {
    increment(draft) {
      draft.count += 1;
    },
    decrement(draft) {
      draft.count -= 1;
    },
  },
});

// actions 类型
type CounterActions = Actions<typeof store>;

function DocDemo() {
  const [state, actions] = useStore({
    ...store,
    state: {
      count: 1,
    },
  });
  return <ChildDemo state={state} actions={actions} />;
}

interface ChildDemoProps {
  state: CounterState;
  actions: CounterActions;
}

function ChildDemo({ state, actions }: ChildDemoProps) {
  return (
    <Space>
      count: <strong>{state.count}</strong>
      <Button onClick={actions.increment}>增加</Button>
      <Button onClick={actions.decrement}>减少</Button>
    </Space>
  );
}

export default DocDemo;
```

## 问题

1. 如何在 `reducers` 中获取当前的 `state`?

从 `immer` 中导出 `current` 包装

```typescript
import { current } from 'immer';

const store = defineStore({
  state: {
    data: {
      list: [],
      total: 0,
    },
  },
  reducers: {
    onUpdate(draft) {
      const data = current(draft.data);
    },
  },
});
```

## useMethods

持久化 function 的 Hook

```tsx
useMethods({
  test() {},
  test1() {},
});
```

