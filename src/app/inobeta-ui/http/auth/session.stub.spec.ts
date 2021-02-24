import {of} from 'rxjs';
import {fixtures} from './session.fixture.spec';
import {authServiceStub} from './auth.service.stub.spec';
import {localStorageStub} from './local-storage.stub.spec';
import {cookiesStorageStub} from './cookies-storage.stub.spec';

export const sessionServiceStub = {

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
