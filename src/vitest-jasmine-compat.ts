/* c8 ignore file */
/* istanbul ignore file */

import { expect, vi } from 'vitest';

function ibWrapHook(hook: (...args: unknown[]) => unknown): () => Promise<void> {
  return () => new Promise<void>((resolve, reject) => {
    try {
      if (hook.length > 0) {
        hook((error?: unknown) => error ? reject(error) : resolve());
      } else {
        Promise.resolve(hook()).then(() => resolve(), reject);
      }
    } catch (error) {
      reject(error);
    }
  });
}

const ibBeforeEach = globalThis.beforeEach;
const ibAfterEach = globalThis.afterEach;
globalThis.beforeEach = ((hook: (...args: unknown[]) => unknown, timeout?: number) =>
  ibBeforeEach(ibWrapHook(hook), timeout)) as typeof beforeEach;
globalThis.afterEach = ((hook: (...args: unknown[]) => unknown, timeout?: number) =>
  ibAfterEach(ibWrapHook(hook), timeout)) as typeof afterEach;

const ibIt = globalThis.it;
globalThis.it = ((name: string, hook: (...args: unknown[]) => unknown, timeout?: number) =>
  ibIt(name, hook.length > 0 ? ibWrapHook(hook) : hook, timeout)) as typeof it;

if (typeof globalThis.localStorage === 'undefined') {
  const values = new Map<string, string>();
  globalThis.localStorage = {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key: string) => values.get(key) ?? null,
    key: (index: number) => [...values.keys()][index] ?? null,
    removeItem: (key: string) => values.delete(key),
    setItem: (key: string, value: string) => values.set(key, String(value)),
  } as Storage;
}

const ibStorage = globalThis.localStorage;
const ibStorageMethods = {
  clear: ibStorage.clear,
  getItem: ibStorage.getItem,
  key: ibStorage.key,
  removeItem: ibStorage.removeItem,
  setItem: ibStorage.setItem,
};

expect.extend({
  toBeTrue(received: unknown) {
    return {
      pass: received === true,
      message: () => `expected ${received} to be true`,
    };
  },
  toBeFalse(received: unknown) {
    return {
      pass: received === false,
      message: () => `expected ${received} to be false`,
    };
  },
  toHaveSize(received: unknown, expected: number) {
    const size = (received as { length?: number })?.length;
    return {
      pass: size === expected,
      message: () => `expected ${size} to have size ${expected}`,
    };
  },
  toHaveBeenCalledOnceWith(this: { equals: (actual: unknown, expected: unknown) => boolean }, received: { mock?: { calls: unknown[][] } }, ...expected: unknown[]) {
    const calls = received?.mock?.calls ?? [];
    const pass = calls.length === 1 && this.equals(calls[0], expected);
    return {
      pass,
      message: () => `expected spy to have been called once with ${JSON.stringify(expected)}`,
    };
  },
});

if (typeof globalThis.IntersectionObserver === 'undefined') {
  globalThis.IntersectionObserver = class {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  } as unknown as typeof IntersectionObserver;
}

if (typeof globalThis.DataTransfer === 'undefined') {
  globalThis.DataTransfer = class {
    private _files: File[] = [];
    readonly items = { add: (file: File) => this._files.push(file) };
    get files(): FileList {
      return Object.assign(this._files, { item: (index: number) => this._files[index] ?? null }) as unknown as FileList;
    }
  } as unknown as typeof DataTransfer;
}

type IbVitestMock = ReturnType<typeof vi.fn>;

type IbJasmineSpy = IbVitestMock & {
  and: {
    callFake: (implementation: (...args: unknown[]) => unknown) => IbJasmineSpy;
    callThrough: () => IbJasmineSpy;
    returnValue: (value: unknown) => IbJasmineSpy;
    stub: () => IbJasmineSpy;
    throwError: (error: unknown) => IbJasmineSpy;
  };
  calls: {
    all: () => Array<{ args: unknown[] }>;
    argsFor: (index: number) => unknown[];
    count: () => number;
    first: () => { args: unknown[] };
    mostRecent: () => { args: unknown[] };
    reset: () => void;
  };
};

function ibJasmineSpy(mock: IbVitestMock, original?: (...args: unknown[]) => unknown): IbJasmineSpy {
  const spy = mock as IbJasmineSpy;
  const calls = () => spy.mock.calls as unknown[][];

  spy.and = {
    callFake: (implementation) => {
      spy.mockImplementation(implementation);
      return spy;
    },
    callThrough: () => {
      if (original) {
        spy.mockImplementation(original);
      }
      return spy;
    },
    returnValue: (value) => {
      spy.mockReturnValue(value);
      return spy;
    },
    stub: () => {
      spy.mockImplementation(() => undefined);
      return spy;
    },
    throwError: (error) => {
      spy.mockImplementation(() => {
        throw typeof error === 'string' ? new Error(error) : error;
      });
      return spy;
    },
  };
  spy.calls = {
    all: () => calls().map((args) => ({ args })),
    argsFor: (index) => calls()[index],
    count: () => calls().length,
    first: () => ({ args: calls()[0] }),
    mostRecent: () => ({ args: calls().at(-1) }),
    reset: () => spy.mockClear(),
  };

  return spy;
}

function ibCreateSpy(): IbJasmineSpy {
  return ibJasmineSpy(vi.fn());
}

function ibCreateSpyObj(methods: string[]): Record<string, IbJasmineSpy> {
  return Object.fromEntries(methods.map((method) => [method, ibCreateSpy()]));
}

const ibClock = {
  install: () => vi.useFakeTimers(),
  mockDate: (date: Date) => vi.setSystemTime(date),
  uninstall: () => vi.useRealTimers(),
};

const ibJasmine = {
  any: expect.any,
  clock: () => ibClock,
  createSpy: () => ibCreateSpy(),
  createSpyObj: (nameOrMethods: string | string[], maybeMethods?: string[]) => (
    ibCreateSpyObj(Array.isArray(nameOrMethods) ? nameOrMethods : maybeMethods ?? [])
  ),
  objectContaining: expect.objectContaining,
  stringMatching: expect.stringMatching,
};

globalThis.jasmine = ibJasmine as unknown as typeof jasmine;
globalThis.spyOn = ((object: object, method: string) => {
  const original = object[method as keyof typeof object] as unknown as (...args: unknown[]) => unknown;
  const spy = ibJasmineSpy(vi.spyOn(object, method as never), original);
  spy.and.stub();
  return spy;
}) as unknown as typeof spyOn;

afterEach(() => {
  vi.restoreAllMocks();
  Object.assign(ibStorage, ibStorageMethods);
});
