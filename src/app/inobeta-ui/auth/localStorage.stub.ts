export const localStorageStub = {
  storage: {},
  empty: true,
  get: () => {
    if (localStorageStub.empty) {
      return null;
    } else {
      return {
        valid: true,
        user: {
          username: 'salvatore.niglio@inobeta.net',
          password: '',
          authToken: 'eyJhbGciOigP4O_MSO'
        },
        userData: {
          id: 1,
          username: 'salvo',
          name: 'Salvatore',
          surname: 'Niglio',
          is_active: true,
          email: 'salvatore.niglio@inobeta.net',
          created_at: '2019-10-28T11:03:46.000Z',
          updated_at: '2019-10-28T11:03:46.000Z',
          user_type_id: 1,
          token: 'eyJhbGciOigP4O_MSO'
        }
      };
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
  }
};
