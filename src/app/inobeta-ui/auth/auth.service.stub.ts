import {localStorageStub} from './localStorage.stub';
import {cookiesStorageStub} from './cookiesStorage.stub';

export const authServiceStub = {

  activeSession: {
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
    },
    authToken: 'eyJhbGciOigP4O_MSO'
  },

  storeSession: () => {
    authServiceStub.activeSession.valid = true;
    return localStorageStub.set('activeSession', authServiceStub.activeSession);
  },

  cookieSession: () => {
    this.activeSession.valid = true;
    return cookiesStorageStub.set('activeSession', authServiceStub.activeSession);
  },

  logout: () => {
    authServiceStub.activeSession = null;
    cookiesStorageStub.set('activeSession', null);
    localStorageStub.set('activeSession', null);
    return true;
  },

  isLoggedIn: () => {
    return authServiceStub.activeSession !== null;
  }
};
