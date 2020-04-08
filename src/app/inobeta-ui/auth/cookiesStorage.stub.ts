export const cookiesStorageStub = {
  storage: null,
  empty: true,
  get: (key) => {
    if (cookiesStorageStub.empty) {
      return null;
    } else {
      return cookiesStorageStub.storage[key];
    }
  },
  set: (key, value) => {
    cookiesStorageStub.storage[key] = value;
    cookiesStorageStub.empty = false;
    return true;
  },
  clear: () => {
    cookiesStorageStub.storage = {};
    cookiesStorageStub.empty = true;
  },
  remove: (key) => {
    delete cookiesStorageStub.storage[key];
  }
};
