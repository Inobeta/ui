export const cookiesStorageStub = {
  storage: null,
  empty: true,
  get: () => {
    if (cookiesStorageStub.empty) {
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
  set: (item) => {
    this.storage = item;
    this.empty = !item;
    return true;
  }
};
