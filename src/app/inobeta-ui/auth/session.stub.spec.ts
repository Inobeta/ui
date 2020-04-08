import {of} from 'rxjs';
import {fixtures} from './session.fixture.spec';
import {authServiceStub} from './auth.service.stub';
import {localStorageStub} from './localStorage.stub';
import {cookiesStorageStub} from './cookiesStorage.stub';

export const sessionStubSpec = {

  setAuthtype: () => {
    return true;
  },

  login: () => {
      authServiceStub.storeSession();
      return of(fixtures.login);
  },

  logout: () => {
    localStorageStub.clear();
    cookiesStorageStub.clear();
  }

};
