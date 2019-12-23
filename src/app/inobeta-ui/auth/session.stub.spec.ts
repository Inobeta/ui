import {of} from 'rxjs';
import {fixtures} from './session.fixture.spec';
import {authServiceStub} from './auth.service.stub';

export const sessionStubSpec = {

  setAuthtype: () => {
    return true;
  },

  login: () => {
      authServiceStub.storeSession();
      return of(fixtures.login);
  },

  logout: () => {
    authServiceStub.logout();
    return of(fixtures.login);
  }

};
