import {of} from 'rxjs';
import {fixtures} from './session.fixture.spec';
import {authServiceStub} from './auth.service.stub';
import {localStorageStub} from './local-storage.stub';
import {cookiesStorageStub} from './cookies-storage.stub';

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
