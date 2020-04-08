export const localStorageStub = {
  storage: {},
  empty: true,
  get: (key) => {
    if (localStorageStub.empty) {
      return null;
    } else {
      return localStorageStub.storage[key];
    }
  },
  set: (key, value) => {
    localStorageStub.storage[key] = value;
    localStorageStub.empty = false;
    return true;
  },
  clear: () => {
    localStorageStub.storage = {};
    localStorageStub.empty = true;
  },
  remove: (key) => {
    delete localStorage.storage[key];
  }
};
